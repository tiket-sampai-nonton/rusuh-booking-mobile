import { act, renderHook } from "@testing-library/react-native";

import { ServerClock } from "@domain/services/server-clock";
import type { ClockPort } from "@domain/services/clock.port";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";

class FakeClock implements ClockPort {
  constructor(public t: number) {}
  now(): number {
    return this.t;
  }
}

describe("useServerCountdown", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("reports remaining ms from the ServerClock and ticks down", () => {
    const device = Date.parse("2026-12-01T00:00:00.000Z");
    const clock = new ServerClock(new FakeClock(device));
    const { result } = renderHook(() =>
      useServerCountdown({
        clock,
        expiresAtIso: "2026-12-01T00:00:10.000Z",
        serverTimeIso: "2026-12-01T00:00:00.000Z",
      }),
    );
    act(() => {
      jest.advanceTimersByTime(0);
    });
    expect(result.current.remainingMs).toBe(10000);
    expect(result.current.expired).toBe(false);
  });

  it("fires onExpire once when the deadline passes", () => {
    const fake = new FakeClock(Date.parse("2026-12-01T00:00:00.000Z"));
    const clock = new ServerClock(fake);
    const onExpire = jest.fn();
    renderHook(() =>
      useServerCountdown({
        clock,
        expiresAtIso: "2026-12-01T00:00:02.000Z",
        serverTimeIso: "2026-12-01T00:00:00.000Z",
        onExpire,
      }),
    );
    act(() => {
      fake.t = Date.parse("2026-12-01T00:00:03.000Z"); // past the deadline
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1); // once, not per tick
  });

  it("is inert with no expiresAt", () => {
    const clock = new ServerClock(new FakeClock(0));
    const { result } = renderHook(() => useServerCountdown({ clock }));
    expect(result.current.remainingMs).toBe(0);
    expect(result.current.expired).toBe(false);
  });
});
