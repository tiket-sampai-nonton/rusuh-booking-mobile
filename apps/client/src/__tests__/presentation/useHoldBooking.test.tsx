import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { mapError } from "@domain/errors/error-mapper";
import type {
  AttendeeCheck,
  Booking,
  BookingItemInput,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { useHoldBooking } from "@presentation/hooks/useHoldBooking";
import { useSessionStore } from "@presentation/stores/session-store";

const ROW = {
  rowId: "row-fixture-1",
  categoryId: "REG",
  attendeeName: "A",
  attendeeNik: "3171010101010001",
  useBuyerNik: false,
};

class FakeRepo implements BookingRepository {
  throwOnHold: Error | null = null;
  holds = 0;
  async createSession(eventId: string): Promise<BookingSession> {
    return { sessionId: "s", eventId, expiresAt: "", maxSelectable: 3, categories: [] };
  }
  async getCurrentSession(): Promise<BookingSession | null> {
    return null;
  }
  async checkAttendee(_s: string, _n: string): Promise<AttendeeCheck> {
    return { nikMasked: "3***", result: "AVAILABLE" };
  }
  async setBuyer(): Promise<void> {}
  async hold(
    _s: string,
    _i: readonly BookingItemInput[],
    _k: string,
  ): Promise<Booking> {
    this.holds += 1;
    if (this.throwOnHold) throw this.throwOnHold;
    return { bookingId: "bk-9", sessionId: "s", status: "HELD", amountMinor: 90000000 };
  }
}

function wrapper(repo: BookingRepository) {
  const base = createContainer({ useMocks: true });
  const container: Container = { ...base, bookingRepository: repo };
  const qc = new QueryClient({
    defaultOptions: {
      mutations: { retry: false, gcTime: Infinity },
      queries: { retry: false, gcTime: Infinity },
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

describe("useHoldBooking (RBT-054)", () => {
  beforeEach(() => useSessionStore.getState().reset());

  it("holds and records the booking id + amount in the session store", async () => {
    const repo = new FakeRepo();
    const { result } = renderHook(() => useHoldBooking(), {
      wrapper: wrapper(repo),
    });
    const booking = await result.current.hold({
      sessionId: "sess-1",
      rows: [ROW],
      buyerNik: "3171999999999999",
    });
    expect(booking.bookingId).toBe("bk-9");
    await waitFor(() =>
      expect(useSessionStore.getState().bookingId).toBe("bk-9"),
    );
    expect(useSessionStore.getState().amountMinor).toBe(90000000);
  });

  it("surfaces a typed DomainError on a hold conflict (no booking recorded)", async () => {
    const repo = new FakeRepo();
    repo.throwOnHold = mapError({ code: "CATEGORY_UNAVAILABLE" });
    const { result } = renderHook(() => useHoldBooking(), {
      wrapper: wrapper(repo),
    });
    await expect(
      result.current.hold({
        sessionId: "sess-1",
        rows: [ROW],
        buyerNik: "3171999999999999",
      }),
    ).rejects.toMatchObject({ code: "CATEGORY_UNAVAILABLE" });
    await waitFor(() => expect(result.current.error?.code).toBe("CATEGORY_UNAVAILABLE"));
    expect(useSessionStore.getState().bookingId).toBeUndefined();
  });
});
