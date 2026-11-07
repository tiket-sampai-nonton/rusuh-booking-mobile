import { ServerClock } from "@domain/services/server-clock";
import type { ClockPort } from "@domain/services/clock.port";

/** Controllable fake clock: `t` is the device epoch millis the adapter reports. */
class FakeClock implements ClockPort {
  constructor(public t: number) {}
  now(): number {
    return this.t;
  }
}

describe("domain/ServerClock", () => {
  it("applies the server offset: serverNow reflects serverTime at sync", () => {
    const device = Date.parse("2026-01-01T00:00:00.000Z");
    const server = Date.parse("2026-01-01T00:00:05.000Z"); // server 5s ahead
    const clock = new FakeClock(device);
    const sut = new ServerClock(clock);

    sut.sync("2026-01-01T00:00:05.000Z");

    // Immediately after sync, serverNow == the synced server time.
    expect(sut.serverNow()).toBe(server);

    // Device advances 2s → server time advances the same 2s (offset held).
    clock.t = device + 2000;
    expect(sut.serverNow()).toBe(server + 2000);
  });

  it("remaining is never negative: a past expiry returns 0", () => {
    const device = Date.parse("2026-01-01T00:00:00.000Z");
    const clock = new FakeClock(device);
    const sut = new ServerClock(clock);
    sut.sync("2026-01-01T00:00:00.000Z"); // offset 0, server == device

    // Future expiry → positive remaining.
    expect(sut.remaining("2026-01-01T00:00:10.000Z")).toBe(10000);
    // Exact expiry → 0.
    expect(sut.remaining("2026-01-01T00:00:00.000Z")).toBe(0);
    // Past expiry → clamped to 0, never negative.
    expect(sut.remaining("2025-12-31T23:59:50.000Z")).toBe(0);
  });

  it("device-clock jump does NOT reset the offset (only re-sync changes it)", () => {
    const device = Date.parse("2026-01-01T00:00:00.000Z");
    const server = Date.parse("2026-01-01T00:00:05.000Z"); // server 5s ahead
    const clock = new FakeClock(device);
    const sut = new ServerClock(clock);
    sut.sync("2026-01-01T00:00:05.000Z");

    // Simulate a backward device-clock jump (manual set / NTP / refresh).
    clock.t = Date.parse("2020-06-15T12:00:00.000Z");
    // The 5s offset is still applied on top of the (jumped) device time.
    expect(sut.serverNow()).toBe(clock.t + 5000);

    // Simulate a forward device-clock jump.
    clock.t = Date.parse("2030-03-20T08:30:00.000Z");
    expect(sut.serverNow()).toBe(clock.t + 5000);

    // remaining still measured on the held offset, not reset by the jump.
    expect(sut.serverNow()).toBe(server + (clock.t - device));
  });

  it("re-sync updates the offset", () => {
    const device = Date.parse("2026-01-01T00:00:00.000Z");
    const clock = new FakeClock(device);
    const sut = new ServerClock(clock);

    sut.sync("2026-01-01T00:00:05.000Z"); // +5s offset
    expect(sut.serverNow()).toBe(Date.parse("2026-01-01T00:00:05.000Z"));

    // Re-sync against a server that is now BEHIND the device → new (negative) offset.
    sut.sync("2025-12-31T23:59:57.000Z"); // -3s offset
    expect(sut.serverNow()).toBe(Date.parse("2025-12-31T23:59:57.000Z"));

    // The new offset (−3s) is what persists as the device advances.
    clock.t = device + 1000;
    expect(sut.serverNow()).toBe(Date.parse("2025-12-31T23:59:57.000Z") + 1000);
  });

  it("unsynced ServerClock behaves as zero offset (serverNow == device now)", () => {
    const device = Date.parse("2026-01-01T00:00:00.000Z");
    const clock = new FakeClock(device);
    const sut = new ServerClock(clock);

    expect(sut.serverNow()).toBe(device);
    expect(sut.remaining("2026-01-01T00:00:02.000Z")).toBe(2000);
  });
});
