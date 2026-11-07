import { Platform } from "react-native";
import {
  createContainer,
  createQueueMembershipStorage,
  createTokenStorage,
  readUseMocksFlag,
} from "@providers/container";
import { InMemoryTokenStorage } from "@infrastructure/__fixtures__/in-memory-token-storage";
import { InMemoryQueueMembership } from "@infrastructure/__fixtures__/in-memory-queue-membership";
import { SecureStoreTokenStorage } from "@infrastructure/auth/secure-store-token-storage";
import { SecureStoreQueueMembership } from "@infrastructure/queue/secure-store-queue-membership";
import { MockBookingRepository } from "@infrastructure/__fixtures__/mock-booking.repository";
import { MockEventRepository } from "@infrastructure/__fixtures__/mock-event.repository";
import { MockQueueRepository } from "@infrastructure/__fixtures__/mock-queue.repository";
import { MockPaymentRepository } from "@infrastructure/__fixtures__/mock-payment.repository";
import { MockUserRepository } from "@infrastructure/__fixtures__/mock-user.repository";
import { MockNotificationAdapter } from "@infrastructure/__fixtures__/mock-notification.adapter";
import { MockTicketHistoryRepository } from "@infrastructure/__fixtures__/mock-ticket-history.repository";
import { ExpoFileShareAdapter } from "@infrastructure/files/expo-file-share.adapter";
import { WebFileShareAdapter } from "@infrastructure/files/web-file-share.adapter";
import { HttpTicketHistoryRepository } from "@infrastructure/api/http-ticket-history.repository";
import { MockHttpClient } from "@infrastructure/__fixtures__/mock-http-client";
import { HttpEventRepository } from "@infrastructure/api/http-event.repository";
import { HttpQueueRepository } from "@infrastructure/api/http-queue.repository";
import { HttpBookingRepository } from "@infrastructure/api/http-booking.repository";
import { HttpPaymentRepository } from "@infrastructure/api/http-payment.repository";
import { HttpUserRepository } from "@infrastructure/api/http-user.repository";
import { RefreshingHttpClient } from "@infrastructure/http/refreshing-http-client";
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
    expect(c.bookingRepository).toBeInstanceOf(MockBookingRepository);
    expect(c.paymentRepository).toBeInstanceOf(MockPaymentRepository);
    expect(c.userRepository).toBeInstanceOf(MockUserRepository);
    expect(c.notification).toBeInstanceOf(MockNotificationAdapter);
    expect(c.fileShare).toBeInstanceOf(
      Platform.OS === "web" ? WebFileShareAdapter : ExpoFileShareAdapter,
    );
    expect(c.ticketHistoryRepository).toBeInstanceOf(
      MockTicketHistoryRepository,
    );
    expect(c.httpClient).toBeInstanceOf(MockHttpClient);
  });

  it("binds the real system clock in mock mode too", () => {
    expect(c.clock).toBeInstanceOf(SystemClock);
    expect(typeof c.clock.now()).toBe("number");
  });

  it("binds a TokenStorage in mock mode (platform-selected, RBT-023)", () => {
    expect(c.tokenStorage).toBeDefined();
    expect(typeof c.tokenStorage.save).toBe("function");
    expect(typeof c.tokenStorage.load).toBe("function");
    expect(typeof c.tokenStorage.clear).toBe("function");
  });

  it("binds a QueueMembershipStorage in mock mode (platform-selected, RBT-041)", () => {
    expect(c.queueMembership).toBeDefined();
    expect(typeof c.queueMembership.save).toBe("function");
    expect(typeof c.queueMembership.load).toBe("function");
    expect(typeof c.queueMembership.clear).toBe("function");
  });

  it("binds IdempotencyKeys in mock mode that mint+reuse+clear (RBT-054)", () => {
    expect(c.idempotencyKeys).toBeDefined();
    const k1 = c.idempotencyKeys.mint("action-x");
    expect(k1).toMatch(/^idem_/);
    expect(c.idempotencyKeys.mint("action-x")).toBe(k1); // reused
    c.idempotencyKeys.clear("action-x");
    expect(c.idempotencyKeys.peek("action-x")).toBeUndefined();
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

describe("providers/container — createTokenStorage (RBT-023)", () => {
  it("binds the in-memory fallback on web (SecureStore unsupported)", () => {
    expect(createTokenStorage("web")).toBeInstanceOf(InMemoryTokenStorage);
  });

  it("binds the secure-store adapter on iOS", () => {
    expect(createTokenStorage("ios")).toBeInstanceOf(SecureStoreTokenStorage);
  });

  it("binds the secure-store adapter on Android", () => {
    expect(createTokenStorage("android")).toBeInstanceOf(
      SecureStoreTokenStorage,
    );
  });
});

describe("providers/container — createQueueMembershipStorage (RBT-041)", () => {
  it("binds the in-memory fallback on web (SecureStore unsupported)", () => {
    expect(createQueueMembershipStorage("web")).toBeInstanceOf(
      InMemoryQueueMembership,
    );
  });

  it("binds the secure-store adapter on iOS", () => {
    expect(createQueueMembershipStorage("ios")).toBeInstanceOf(
      SecureStoreQueueMembership,
    );
  });

  it("binds the secure-store adapter on Android", () => {
    expect(createQueueMembershipStorage("android")).toBeInstanceOf(
      SecureStoreQueueMembership,
    );
  });
});

describe("providers/container — createContainer (real mode, RBT-010 wired)", () => {
  it("binds HTTP repositories when a base URL is configured", () => {
    const c = createContainer({
      useMocks: false,
      baseUrl: "https://api.test/v1",
    });
    expect(c.eventRepository).toBeInstanceOf(HttpEventRepository);
    expect(c.queueRepository).toBeInstanceOf(HttpQueueRepository);
    expect(c.bookingRepository).toBeInstanceOf(HttpBookingRepository);
    expect(c.paymentRepository).toBeInstanceOf(HttpPaymentRepository);
    expect(c.userRepository).toBeInstanceOf(HttpUserRepository);
    expect(c.ticketHistoryRepository).toBeInstanceOf(
      HttpTicketHistoryRepository,
    );
    expect(c.httpClient).toBeInstanceOf(RefreshingHttpClient);
  });

  it("throws a clear error when the base URL is missing in real mode", () => {
    expect(() => createContainer({ useMocks: false, baseUrl: "" })).toThrow(
      /EXPO_PUBLIC_API_BASE_URL is required/i,
    );
  });
});
