import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import type {
  BookingAvailabilitySnapshot,
  AttendeeCheck,
  Booking,
  BookingItemInput,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import {
  useCreateBookingSession,
  useRestoreBookingSession,
} from "@presentation/hooks/useBookingSession";
import { useSessionStore } from "@presentation/stores/session-store";

const SESSION: BookingSession = {
  sessionId: "sess-1",
  eventId: "evt-1",
  expiresAt: "2026-12-01T00:05:00.000Z",
  categories: [],
};

class FakeBookingRepo implements BookingRepository {
  current: BookingSession | null = SESSION;
  async createSession(admissionToken: string): Promise<BookingSession> {
    const eventId = admissionToken.replace(/^mock-admission:/, "");
    return { ...SESSION, eventId };
  }
  async getCurrentSession(): Promise<BookingSession | null> {
    return this.current;
  }
  async checkAttendee(_s: string, _n: string): Promise<AttendeeCheck> {
    return { nikMasked: "3***", result: "AVAILABLE" };
  }
  async hold(
    _s: string,
    _i: readonly BookingItemInput[],
    _k: string,
    _buyer: NonNullable<Parameters<BookingRepository["hold"]>[3]>,
  ): Promise<Booking> {
    return {
      bookingId: "b1",
      sessionId: "sess-1",
      status: "HELD",
      amountMinor: 1,
    };
  }
}

function wrapper(repo: BookingRepository, queryRetry: false | number = false) {
  const base = createContainer({ useMocks: true });
  const container: Container = { ...base, bookingRepository: repo };
  const qc = new QueryClient({
    defaultOptions: {
      mutations: { retry: false, gcTime: Infinity },
      queries: { retry: queryRetry, gcTime: Infinity },
    },
  });
  return function Wrapper({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement {
    return (
      <QueryClientProvider client={qc}>
        <ServiceProvider container={container}>{children}</ServiceProvider>
      </QueryClientProvider>
    );
  };
}

describe("useCreateBookingSession", () => {
  beforeEach(() => useSessionStore.getState().reset());

  it("creates a session and records sessionId in the store", async () => {
    const { result } = renderHook(() => useCreateBookingSession(), {
      wrapper: wrapper(new FakeBookingRepo()),
    });
    const session = await result.current.create("mock-admission:evt-7");
    expect(session.eventId).toBe("evt-7");
    await waitFor(() =>
      expect(useSessionStore.getState().sessionId).toBe("sess-1"),
    );
  });
});

describe("useRestoreBookingSession", () => {
  beforeEach(() => useSessionStore.getState().reset());

  it("restores the current session + records it", async () => {
    const { result } = renderHook(() => useRestoreBookingSession(true), {
      wrapper: wrapper(new FakeBookingRepo()),
    });
    await waitFor(() =>
      expect(result.current.session?.sessionId).toBe("sess-1"),
    );
    expect(useSessionStore.getState().sessionId).toBe("sess-1");
  });

  it("returns null session when none active (no store write)", async () => {
    const repo = new FakeBookingRepo();
    repo.current = null;
    const { result } = renderHook(() => useRestoreBookingSession(true), {
      wrapper: wrapper(repo),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.session).toBeNull();
    expect(useSessionStore.getState().sessionId).toBeUndefined();
  });

  it("does not fetch when disabled", async () => {
    const { result } = renderHook(() => useRestoreBookingSession(false), {
      wrapper: wrapper(new FakeBookingRepo()),
    });
    expect(result.current.session).toBeUndefined();
  });

  it("defaults enabled to true when called with no argument", async () => {
    const { result } = renderHook(() => useRestoreBookingSession(), {
      wrapper: wrapper(new FakeBookingRepo()),
    });
    await waitFor(() =>
      expect(result.current.session?.sessionId).toBe("sess-1"),
    );
  });

  it("does not automatically repeat a failed session request", async () => {
    class ExpiredSessionRepo extends FakeBookingRepo {
      getSession = jest.fn(async () => {
        throw new Error("SESSION_EXPIRED: hold expired");
      });
    }
    const repo = new ExpiredSessionRepo();
    const { result } = renderHook(
      () => useRestoreBookingSession(true, "expired-session"),
      { wrapper: wrapper(repo, 2) },
    );

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(repo.getSession).toHaveBeenCalledTimes(1);
  });

  it("updates availability from the stream without refetching the session", async () => {
    let notify = (_snapshot: BookingAvailabilitySnapshot) => {};
    const close = jest.fn();
    class StreamingRepo extends FakeBookingRepo {
      getSession = jest.fn(async () => ({
        ...SESSION,
        categories: [
          {
            categoryId: "cat-1",
            code: "FEST",
            name: "Festival",
            priceMinor: 2750,
            available: 5,
          },
        ],
      }));
      subscribeAvailability = jest.fn(
        (
          _id: string,
          onAvailability: (snapshot: BookingAvailabilitySnapshot) => void,
        ) => {
          notify = onAvailability;
          return close;
        },
      );
    }
    const repo = new StreamingRepo();
    const view = renderHook(() => useRestoreBookingSession(true, "sess-1"), {
      wrapper: wrapper(repo),
    });
    await waitFor(() =>
      expect(repo.subscribeAvailability).toHaveBeenCalledTimes(1),
    );
    expect(repo.getSession).toHaveBeenCalledTimes(1);
    act(() => notify({ categories: [{ categoryId: "cat-1", available: 4 }] }));
    await waitFor(() =>
      expect(view.result.current.session?.categories[0]?.available).toBe(4),
    );
    expect(repo.getSession).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
