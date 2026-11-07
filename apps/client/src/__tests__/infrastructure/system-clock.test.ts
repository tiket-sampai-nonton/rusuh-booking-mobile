import { SystemClock } from "@infrastructure/time/system-clock";

describe("infrastructure/SystemClock", () => {
  it("returns the host epoch millis", () => {
    const clock = new SystemClock();
    const before = Date.now();
    const t = clock.now();
    const after = Date.now();
    expect(t).toBeGreaterThanOrEqual(before);
    expect(t).toBeLessThanOrEqual(after);
  });
});
