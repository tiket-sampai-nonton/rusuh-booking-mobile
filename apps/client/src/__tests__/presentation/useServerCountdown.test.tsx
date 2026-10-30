import { act, renderHook } from "@testing-library/react-native";

import type { ClockPort } from "@domain/services/clock.port";
import { ServerClock } from "@domain/services/server-clock";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";

/** A mutable fake device clock. */
class FakeClock implements ClockPort {
  constructor(public t: number) {}
  now(): number {
    return this.t;
  }
}

describe("useServerCountdown", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("reports remaining time from the server clock and ticks down", () => {
    const device = new FakeClock(1_000_000);
    const clock = new ServerClock(device);
    const expiresAt = new Date(1_000_000 + 10_000).toISOString();

    const { result } = renderHook(() =>
      useServerCountdown({ clock, expiresAtIso: expiresAt }),
    );
    expect(result.current.remainingMs).toBe(10_000);
    expect(result.current.expired).toBe(false);

    act(() => {
      device.t += 4000;
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.remainingMs).toBe(6000);
  });

  it("syncs the offset from serverTime so a skewed device clock is corrected", () => {
    // Device clock is 1 hour behind the server.
    const device = new FakeClock(0);
    const clock = new ServerClock(device);
    const serverTime = new Date(3_600_000).toISOString(); // +1h
    const expiresAt = new Date(3_600_000 + 5000).toISOString();

    const { result } = renderHook(() =>
      useServerCountdown({ clock, expiresAtIso: expiresAt, serverTimeIso: serverTime }),
    );
    // Offset applied: remaining ≈ 5000 despite the 1h device skew.
    expect(result.current.remainingMs).toBe(5000);
  });

  it("fires onExpire once when the deadline passes", () => {
    const device = new FakeClock(0);
    const clock = new ServerClock(device);
    const onExpire = jest.fn();
    const expiresAt = new Date(2000).toISOString();

    renderHook(() =>
      useServerCountdown({ clock, expiresAtIso: expiresAt, onExpire }),
    );
    act(() => {
      device.t = 5000;
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("does nothing without an expiry", () => {
    const clock = new ServerClock(new FakeClock(0));
    const { result } = renderHook(() => useServerCountdown({ clock }));
    expect(result.current.remainingMs).toBe(0);
    expect(result.current.expired).toBe(false);
  });
});
