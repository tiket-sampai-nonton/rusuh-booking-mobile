import { act, renderHook, waitFor } from "@testing-library/react-native";
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
import { useAttendeeCheck } from "@presentation/hooks/useAttendeeCheck";

function attendeeVerdict(nik: string): AttendeeCheck["result"] {
  if (nik.endsWith("00")) return "ALREADY_REGISTERED";
  if (nik.endsWith("99")) return "CHECK_LIMIT_REACHED";
  return "AVAILABLE";
}

const NIK_OK = "3171010101010001";
const NIK_BLOCK = "3171010101010100"; // ...00 → ALREADY_REGISTERED
const NIK_LIMIT = "3171010101010199"; // ...99 → CHECK_LIMIT_REACHED

class FakeRepo implements BookingRepository {
  calls: string[] = [];
  async createSession(eventId: string): Promise<BookingSession> {
    return { sessionId: "s", eventId, expiresAt: "", maxSelectable: 3, categories: [] };
  }
  async getCurrentSession(): Promise<BookingSession | null> {
    return null;
  }
  async checkAttendee(_s: string, nik: string): Promise<AttendeeCheck> {
    this.calls.push(nik);
    const result = attendeeVerdict(nik);
    return { nikMasked: "3***", result };
  }
  async setBuyer(): Promise<void> {}
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
  return function Wrapper({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement {
    return <ServiceProvider container={container}>{children}</ServiceProvider>;
  };
}

describe("useAttendeeCheck (RBT-052 AC2)", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("ignores a non-16-digit NIK (no backend call)", () => {
    const repo = new FakeRepo();
    const { result } = renderHook(() => useAttendeeCheck("s1", 500), {
      wrapper: wrapper(repo),
    });
    act(() => result.current.request("123"));
    act(() => jest.advanceTimersByTime(600));
    expect(repo.calls).toEqual([]);
  });

  it("debounces and resolves AVAILABLE", async () => {
    const repo = new FakeRepo();
    const { result } = renderHook(() => useAttendeeCheck("s1", 500), {
      wrapper: wrapper(repo),
    });
    act(() => result.current.request(NIK_OK));
    expect(repo.calls).toEqual([]); // not yet (debounced)
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() => expect(result.current.checks[NIK_OK]).toBe("AVAILABLE"));
    expect(repo.calls).toEqual([NIK_OK]);
  });

  it("maps ...00 → ALREADY_REGISTERED and ...99 → CHECK_LIMIT_REACHED", async () => {
    const repo = new FakeRepo();
    const { result } = renderHook(() => useAttendeeCheck("s1", 10), {
      wrapper: wrapper(repo),
    });
    act(() => result.current.request(NIK_BLOCK));
    await act(async () => {
      jest.advanceTimersByTime(20);
    });
    await waitFor(() =>
      expect(result.current.checks[NIK_BLOCK]).toBe("ALREADY_REGISTERED"),
    );
    act(() => result.current.request(NIK_LIMIT));
    await act(async () => {
      jest.advanceTimersByTime(20);
    });
    await waitFor(() =>
      expect(result.current.checks[NIK_LIMIT]).toBe("CHECK_LIMIT_REACHED"),
    );
  });

  it("does not re-query a NIK already resolved", async () => {
    const repo = new FakeRepo();
    const { result } = renderHook(() => useAttendeeCheck("s1", 10), {
      wrapper: wrapper(repo),
    });
    act(() => result.current.request(NIK_OK));
    await act(async () => {
      jest.advanceTimersByTime(20);
    });
    await waitFor(() => expect(result.current.checks[NIK_OK]).toBe("AVAILABLE"));
    act(() => result.current.request(NIK_OK)); // same NIK again
    await act(async () => {
      jest.advanceTimersByTime(20);
    });
    expect(repo.calls).toEqual([NIK_OK]); // still one call
  });

  it("only the latest NIK in a debounce window is queried", async () => {
    const repo = new FakeRepo();
    const { result } = renderHook(() => useAttendeeCheck("s1", 500), {
      wrapper: wrapper(repo),
    });
    act(() => result.current.request(NIK_OK));
    act(() => jest.advanceTimersByTime(200)); // within window
    act(() => result.current.request(NIK_LIMIT)); // supersedes
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() =>
      expect(result.current.checks[NIK_LIMIT]).toBe("CHECK_LIMIT_REACHED"),
    );
    expect(repo.calls).toEqual([NIK_LIMIT]); // the superseded one never fired
  });
});
