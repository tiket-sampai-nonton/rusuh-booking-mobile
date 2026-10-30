import {
  createContainer,
  readUseMocksFlag,
} from "@providers/container";
import { MockEventRepository } from "@infrastructure/__fixtures__/mock-event.repository";
import { MockQueueRepository } from "@infrastructure/__fixtures__/mock-queue.repository";
import { MockPaymentRepository } from "@infrastructure/__fixtures__/mock-payment.repository";
import { MockNotificationAdapter } from "@infrastructure/__fixtures__/mock-notification.adapter";
import { MockFileShareAdapter } from "@infrastructure/__fixtures__/mock-file-share.adapter";
import { MockHttpClient } from "@infrastructure/__fixtures__/mock-http-client";
import { SystemClock } from "@infrastructure/time/system-clock";

describe("providers/container — readUseMocksFlag", () => {
  it('is true for "true"', () => {
    expect(readUseMocksFlag({ EXPO_PUBLIC_USE_MOCKS: "true" })).toBe(true);
  });

  it('is true for "1"', () => {
    expect(readUseMocksFlag({ EXPO_PUBLIC_USE_MOCKS: "1" })).toBe(true);
  });

  it("is true when unset (fixtures are the dev default until RBT-010)", () => {
    expect(readUseMocksFlag({})).toBe(true);
  });

  it('is false only when explicitly "false"', () => {
    expect(readUseMocksFlag({ EXPO_PUBLIC_USE_MOCKS: "false" })).toBe(false);
  });

  it('is false when explicitly "0"', () => {
    expect(readUseMocksFlag({ EXPO_PUBLIC_USE_MOCKS: "0" })).toBe(false);
  });

  it("defaults to process.env when no env passed", () => {
    const prev = process.env.EXPO_PUBLIC_USE_MOCKS;
    process.env.EXPO_PUBLIC_USE_MOCKS = "false";
    expect(readUseMocksFlag()).toBe(false);
    if (prev === undefined) {
      delete process.env.EXPO_PUBLIC_USE_MOCKS;
    } else {
      process.env.EXPO_PUBLIC_USE_MOCKS = prev;
    }
  });
});

describe("providers/container — createContainer (mock mode)", () => {
  const c = createContainer({ useMocks: true });

  it("binds every port to its mock adapter", () => {
    expect(c.eventRepository).toBeInstanceOf(MockEventRepository);
    expect(c.queueRepository).toBeInstanceOf(MockQueueRepository);
    expect(c.paymentRepository).toBeInstanceOf(MockPaymentRepository);
    expect(c.notification).toBeInstanceOf(MockNotificationAdapter);
    expect(c.fileShare).toBeInstanceOf(MockFileShareAdapter);
    expect(c.httpClient).toBeInstanceOf(MockHttpClient);
  });

  it("binds the real system clock in mock mode too", () => {
    expect(c.clock).toBeInstanceOf(SystemClock);
    expect(typeof c.clock.now()).toBe("number");
  });

  it("resolves a port to a working mock adapter (wiring proof)", async () => {
    const events = await c.eventRepository.listEvents();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toHaveProperty("id");
  });

  it("reads EXPO_PUBLIC_USE_MOCKS when useMocks is omitted", () => {
    const prev = process.env.EXPO_PUBLIC_USE_MOCKS;
    process.env.EXPO_PUBLIC_USE_MOCKS = "1";
    const d = createContainer();
    expect(d.eventRepository).toBeInstanceOf(MockEventRepository);
    if (prev === undefined) {
      delete process.env.EXPO_PUBLIC_USE_MOCKS;
    } else {
      process.env.EXPO_PUBLIC_USE_MOCKS = prev;
    }
  });
});

describe("providers/container — createContainer (real mode, not wired yet)", () => {
  it("throws a clearly-marked error until real adapters land", () => {
    expect(() => createContainer({ useMocks: false })).toThrow(
      /real adapters are not wired yet/i,
    );
  });
});
