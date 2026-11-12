/**
 * RBT-044 — useAutoClaim hook tests (RNTL renderHook).
 *
 * Renders the hook inside a ServiceProvider (fake BookingRepository) + a real
 * QueryClientProvider, then asserts the FR-08 auto-claim contract:
 *  - status ADMITTED → claim fires EXACTLY once (port called once even across
 *    re-renders) and `claimedSessionId` + `onClaimed(sessionId)` are surfaced;
 *  - a non-admitted status (WAITING) → NO claim;
 *  - a TURN_MISSED failure → `errorState === "TURN_MISSED"`;
 *  - an EVENT_SOLD_OUT failure → `errorState === "EVENT_SOLD_OUT"`.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { mapError } from "@domain/errors/error-mapper";
import type {
  AttendeeCheck,
  Booking,
  BookingItemInput,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";
import type { QueueStatus } from "@domain/repositories/queue.repository";
import { createContainer, type Container } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { useAutoClaim } from "@presentation/hooks/useAutoClaim";

class FakeBookingRepository implements BookingRepository {
  public createSessionCalls: string[] = [];
  public createSessionError: Error | null = null;
  public seq = 0;

  async createSession(admissionToken: string): Promise<BookingSession> {
    this.createSessionCalls.push(admissionToken);
    if (this.createSessionError) throw this.createSessionError;
    this.seq += 1;
    const eventId = admissionToken.replace(/^mock-admission:/, "");
    return {
      sessionId: `sess-${this.seq}`,
      eventId,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      categories: [],
    };
  }
  async getCurrentSession(): Promise<BookingSession | null> {
    return null;
  }
  async checkAttendee(_sessionId: string, nik: string): Promise<AttendeeCheck> {
    return { nikMasked: nik, result: "AVAILABLE" };
  }
  async hold(
    sessionId: string,
    _items: readonly BookingItemInput[],
    _idempotencyKey: string,
    _buyer: NonNullable<Parameters<BookingRepository["hold"]>[3]>,
  ): Promise<Booking> {
    return { bookingId: "bk-1", sessionId, status: "HELD", amountMinor: 0 };
  }
}

function makeWrapper(repo: BookingRepository) {
  const base = createContainer({ useMocks: true });
  const container: Container = { ...base, bookingRepository: repo };
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  return function Wrapper({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement {
    return (
      <QueryClientProvider client={queryClient}>
        <ServiceProvider container={container}>{children}</ServiceProvider>
      </QueryClientProvider>
    );
  };
}

describe("useAutoClaim", () => {
  it("waits for an authoritative queue status before claiming", async () => {
    const repo = new FakeBookingRepository();
    const { result } = renderHook(
      () => useAutoClaim({ eventId: "evt-1", queueId: "q-1" }),
      {
        wrapper: makeWrapper(repo),
      },
    );

    await waitFor(() => expect(result.current.claiming).toBe(false));
    expect(repo.createSessionCalls).toEqual([]);
  });

  it("auto-claims ONCE on ADMITTED and exposes the sessionId", async () => {
    const repo = new FakeBookingRepository();
    const onClaimed = jest.fn();
    const { result } = renderHook(
      () =>
        useAutoClaim({
          eventId: "evt-1",
          queueId: "q-1",
          status: "ADMITTED",
          onClaimed,
        }),
      { wrapper: makeWrapper(repo) },
    );

    await waitFor(() => expect(result.current.claimedSessionId).toBe("sess-1"));
    expect(repo.createSessionCalls).toEqual(["mock-admission:evt-1"]);
    expect(onClaimed).toHaveBeenCalledTimes(1);
    expect(onClaimed).toHaveBeenCalledWith("sess-1");
    expect(result.current.claiming).toBe(false);
    expect(result.current.errorState).toBeNull();
  });

  it("does NOT fire a second claim across re-renders while ADMITTED", async () => {
    const repo = new FakeBookingRepository();
    const { result, rerender } = renderHook(
      ({ status }: { status: QueueStatus }) =>
        useAutoClaim({ eventId: "evt-1", queueId: "q-1", status }),
      {
        wrapper: makeWrapper(repo),
        initialProps: { status: "ADMITTED" as QueueStatus },
      },
    );

    await waitFor(() => expect(result.current.claimedSessionId).toBe("sess-1"));
    // Re-render repeatedly with the same ADMITTED status.
    act(() => rerender({ status: "ADMITTED" }));
    act(() => rerender({ status: "ADMITTED" }));
    await waitFor(() => expect(repo.createSessionCalls).toHaveLength(1));
    expect(repo.createSessionCalls).toEqual(["mock-admission:evt-1"]);
  });

  it("does NOT claim for a non-admitted status", async () => {
    const repo = new FakeBookingRepository();
    const { result } = renderHook(
      () =>
        useAutoClaim({ eventId: "evt-1", queueId: "q-1", status: "WAITING" }),
      { wrapper: makeWrapper(repo) },
    );

    // Give any stray effect a tick to (not) fire.
    await waitFor(() => expect(result.current.claiming).toBe(false));
    expect(repo.createSessionCalls).toEqual([]);
    expect(result.current.claimedSessionId).toBeUndefined();
  });

  it("claims once when status flips WAITING → ADMITTED", async () => {
    const repo = new FakeBookingRepository();
    const { result, rerender } = renderHook(
      ({ status }: { status: QueueStatus }) =>
        useAutoClaim({ eventId: "evt-1", queueId: "q-1", status }),
      {
        wrapper: makeWrapper(repo),
        initialProps: { status: "WAITING" as QueueStatus },
      },
    );
    expect(repo.createSessionCalls).toEqual([]);
    act(() => rerender({ status: "ADMITTED" }));
    await waitFor(() => expect(result.current.claimedSessionId).toBe("sess-1"));
    expect(repo.createSessionCalls).toEqual(["mock-admission:evt-1"]);
  });

  it("surfaces TURN_MISSED as an error state", async () => {
    const repo = new FakeBookingRepository();
    repo.createSessionError = mapError({ code: "TURN_MISSED" });
    const { result } = renderHook(
      () =>
        useAutoClaim({ eventId: "evt-1", queueId: "q-1", status: "ADMITTED" }),
      { wrapper: makeWrapper(repo) },
    );
    await waitFor(() => expect(result.current.errorState).toBe("TURN_MISSED"));
    expect(result.current.claimedSessionId).toBeUndefined();
  });

  it("surfaces EVENT_SOLD_OUT as an error state", async () => {
    const repo = new FakeBookingRepository();
    repo.createSessionError = mapError({ code: "EVENT_SOLD_OUT" });
    const { result } = renderHook(
      () =>
        useAutoClaim({ eventId: "evt-1", queueId: "q-1", status: "ADMITTED" }),
      { wrapper: makeWrapper(repo) },
    );
    await waitFor(() =>
      expect(result.current.errorState).toBe("EVENT_SOLD_OUT"),
    );
  });

  it("surfaces an invalid admission token as a specific recovery state", async () => {
    const repo = new FakeBookingRepository();
    repo.createSessionError = mapError({ code: "ADMISSION_TOKEN_INVALID" });
    const { result } = renderHook(
      () =>
        useAutoClaim({ eventId: "evt-1", queueId: "q-1", status: "ADMITTED" }),
      { wrapper: makeWrapper(repo) },
    );
    await waitFor(() =>
      expect(result.current.errorState).toBe("ADMISSION_TOKEN_INVALID"),
    );
    expect(result.current.error).not.toBeNull();
  });

  it("maps any other claim failure to the UNKNOWN error state", async () => {
    const repo = new FakeBookingRepository();
    repo.createSessionError = mapError({ code: "BOOKING_LOCKED" });
    const { result } = renderHook(
      () =>
        useAutoClaim({ eventId: "evt-1", queueId: "q-1", status: "ADMITTED" }),
      { wrapper: makeWrapper(repo) },
    );
    await waitFor(() => expect(result.current.errorState).toBe("UNKNOWN"));
  });
});
