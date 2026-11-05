import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

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
import { useSetBuyer } from "@presentation/hooks/useSetBuyer";

class FakeRepo implements BookingRepository {
  calls: [string, string, string][] = [];
  async createSession(eventId: string): Promise<BookingSession> {
    return { sessionId: "s", eventId, expiresAt: "", maxSelectable: 3, categories: [] };
  }
  async getCurrentSession(): Promise<BookingSession | null> {
    return null;
  }
  async checkAttendee(_s: string, _n: string): Promise<AttendeeCheck> {
    return { nikMasked: "3***", result: "AVAILABLE" };
  }
  async setBuyer(sessionId: string, nik: string, email: string): Promise<void> {
    this.calls.push([sessionId, nik, email]);
  }
  async hold(
    _s: string,
    _i: readonly BookingItemInput[],
    _k: string,
  ): Promise<Booking> {
    return { bookingId: "b", sessionId: "s", status: "HELD", amountMinor: 1 };
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

describe("useSetBuyer (RBT-053)", () => {
  it("persists the buyer via the port and flips isSaving", async () => {
    const repo = new FakeRepo();
    const { result } = renderHook(() => useSetBuyer(), {
      wrapper: wrapper(repo),
    });
    expect(result.current.isSaving).toBe(false);
    await result.current.setBuyer({
      sessionId: "sess-1",
      buyerNik: "3171999999999999",
      email: "buyer@mail.com",
    });
    expect(repo.calls).toEqual([
      ["sess-1", "3171999999999999", "buyer@mail.com"],
    ]);
    await waitFor(() => expect(result.current.isSaving).toBe(false));
    expect(result.current.error).toBeNull();
  });
});
