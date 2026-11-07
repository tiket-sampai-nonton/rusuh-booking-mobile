/**
 * Composition root — manual Dependency Injection (ARCHITECTURE §2.1 DIP, §3,
 * §11.7 D2). NO DI library: a plain factory constructs adapters and binds them
 * to domain ports. This is the ONLY place concrete adapters are wired.
 *
 * `EXPO_PUBLIC_USE_MOCKS` selects in-memory fixtures or HTTP adapters wired to
 * the 07-11 contract. Real-mode availability still depends on a configured API
 * base URL and backend behavior for the documented integration gaps.
 */
import { Platform } from "react-native";

import type { TokenStorage } from "@domain/auth/token-storage.port";
import type { QueueMembershipStorage } from "@domain/queue/queue-membership.port";
import type { BookingRepository } from "@domain/repositories/booking.repository";
import type { EventRepository } from "@domain/repositories/event.repository";
import type { PaymentRepository } from "@domain/repositories/payment.repository";
import type { QueueRepository } from "@domain/repositories/queue.repository";
import type { UserRepository } from "@domain/repositories/user.repository";
import type { TicketHistoryRepository } from "@domain/repositories/ticket-history.repository";
import { IdempotencyKeys } from "@domain/idempotency/idempotency-key";
import { InMemoryIdempotencyStore } from "@infrastructure/__fixtures__/in-memory-idempotency-store";
import { DurableIdempotencyStore } from "@infrastructure/idempotency/durable-idempotency-store";
import type { ClockPort } from "@domain/services/clock.port";
import type { FileSharePort } from "@domain/services/file-share.port";
import type { NotificationPort } from "@domain/services/notification.port";
import type { PushSubscriptionPort } from "@domain/services/push-subscription.port";
import { HttpPushSubscriptionAdapter } from "@infrastructure/notifications/http-push-subscription.adapter";
import { ServerClock } from "@domain/services/server-clock";
import { HttpBookingRepository } from "@infrastructure/api/http-booking.repository";
import { HttpEventRepository } from "@infrastructure/api/http-event.repository";
import { HttpPaymentRepository } from "@infrastructure/api/http-payment.repository";
import { HttpQueueRepository } from "@infrastructure/api/http-queue.repository";
import { HttpUserRepository } from "@infrastructure/api/http-user.repository";
import { HttpTicketHistoryRepository } from "@infrastructure/api/http-ticket-history.repository";
import { MockBookingRepository } from "@infrastructure/__fixtures__/mock-booking.repository";
import { MockEventRepository } from "@infrastructure/__fixtures__/mock-event.repository";
import { MockHttpClient } from "@infrastructure/__fixtures__/mock-http-client";
import { MockNotificationAdapter } from "@infrastructure/__fixtures__/mock-notification.adapter";
import { ExpoNotificationAdapter } from "@infrastructure/notifications/expo-notification.adapter";
import { WebPushNotificationAdapter } from "@infrastructure/notifications/web-push-notification.adapter";
import { MockPaymentRepository } from "@infrastructure/__fixtures__/mock-payment.repository";
import { MockQueueRepository } from "@infrastructure/__fixtures__/mock-queue.repository";
import { MockUserRepository } from "@infrastructure/__fixtures__/mock-user.repository";
import { MockTicketHistoryRepository } from "@infrastructure/__fixtures__/mock-ticket-history.repository";
import { InMemoryTokenStorage } from "@infrastructure/__fixtures__/in-memory-token-storage";
import { InMemoryQueueMembership } from "@infrastructure/__fixtures__/in-memory-queue-membership";
import { SecureStoreTokenStorage } from "@infrastructure/auth/secure-store-token-storage";
import { SecureStoreQueueMembership } from "@infrastructure/queue/secure-store-queue-membership";
import { WebQueueMembership } from "@infrastructure/queue/web-queue-membership";
import { ExpoFileShareAdapter } from "@infrastructure/files/expo-file-share.adapter";
import { WebFileShareAdapter } from "@infrastructure/files/web-file-share.adapter";
import { FetchHttpClient } from "@infrastructure/http/fetch-http-client";
import { RefreshingHttpClient } from "@infrastructure/http/refreshing-http-client";
import type { HttpClient } from "@infrastructure/http/http-client";
import { SystemClock } from "@infrastructure/time/system-clock";

/**
 * The container: every domain port bound to one concrete adapter. Hooks read
 * these through `service-context.tsx`; nothing else constructs adapters.
 */
export interface Container {
  readonly clock: ClockPort;
  /**
   * Server-authoritative clock (RBT-011) layered over `clock`. The catalog
   * split (RBT-030) and every timer derive "now" from HERE, never the device
   * clock. Bound in both modes (a platform primitive, not a backend capability).
   */
  readonly serverClock: ServerClock;
  readonly httpClient: HttpClient;
  readonly eventRepository: EventRepository;
  readonly queueRepository: QueueRepository;
  readonly bookingRepository: BookingRepository;
  readonly paymentRepository: PaymentRepository;
  readonly userRepository: UserRepository;
  readonly ticketHistoryRepository: TicketHistoryRepository;
  readonly notification: NotificationPort;
  readonly pushSubscription: PushSubscriptionPort;
  readonly fileShare: FileSharePort;
  readonly tokenStorage: TokenStorage;
  /**
   * Anonymous waiting-room membership persistence (RBT-041). Like
   * {@link tokenStorage} it is a platform primitive: native binds the
   * secure-store adapter, web/tests the in-memory fallback. Bound in BOTH modes.
   */
  readonly queueMembership: QueueMembershipStorage;
  /**
   * Idempotency-Key minting/reuse (RBT-012/054). A client-side primitive (no
   * backend capability) over an in-memory store → bound in BOTH modes so the
   * hold/payment can mint one key per action and reuse it across retry/refresh.
   */
  readonly idempotencyKeys: IdempotencyKeys;
}

/**
 * Pick the TokenStorage adapter for the current platform (RBT-023). SecureStore
 * is native-only, so native binds {@link SecureStoreTokenStorage} (OS keychain /
 * KeyStore) while web binds the in-memory fallback — on web the token lives in
 * memory only and does NOT survive a reload (SECURITY.md tradeoff). Jest runs
 * under the `jest-expo` web-ish default, so tests also get the in-memory store,
 * which keeps the composition root deterministic without touching a keychain.
 */
export function createTokenStorage(
  platformOs: typeof Platform.OS = Platform.OS,
): TokenStorage {
  return platformOs === "web"
    ? new InMemoryTokenStorage()
    : new SecureStoreTokenStorage();
}

/**
 * Pick the QueueMembershipStorage adapter for the current platform (RBT-041).
 * Same platform split as {@link createTokenStorage}: SecureStore is native-only,
 * so native binds {@link SecureStoreQueueMembership} (OS keychain / KeyStore,
 * survives restart) while web binds the in-memory fallback (does NOT survive a
 * reload). Jest runs under the jest-expo web-ish default, so tests get the
 * in-memory store — deterministic without touching a keychain.
 */
export function createQueueMembershipStorage(
  platformOs: typeof Platform.OS = Platform.OS,
): QueueMembershipStorage {
  return platformOs === "web"
    ? new InMemoryQueueMembership()
    : new SecureStoreQueueMembership();
}

export interface ContainerOptions {
  /**
   * Force mock vs real wiring. Omitted → read `EXPO_PUBLIC_USE_MOCKS`
   * (`"true"`/`"1"` → mocks). Explicit value makes tests deterministic without
   * mutating the environment.
   */
  readonly useMocks?: boolean;
  /**
   * Base URL for the real HTTP adapters. Omitted → read
   * `EXPO_PUBLIC_API_BASE_URL`. Passed explicitly so tests are deterministic:
   * `jest-expo` inlines `EXPO_PUBLIC_*` at transform time, so a runtime
   * `process.env` assignment would not be seen.
   */
  readonly baseUrl?: string;
}

/**
 * Whether to use mock wiring, from `EXPO_PUBLIC_USE_MOCKS`.
 *
 * `"false"`/`"0"` → real; anything else (incl. UNSET) → mocks. Mock mode is
 * the dev/demo default; real mode is opt-in and requires an API base URL.
 */
export function readUseMocksFlag(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const raw = env.EXPO_PUBLIC_USE_MOCKS;
  return raw !== "false" && raw !== "0";
}

/**
 * Build the application container.
 *
 * Mock mode binds the in-memory fixtures so the app boots and the funnel is
 * demoable with no backend. Real mode binds the HTTP and platform adapters.
 */
export function createContainer(options: ContainerOptions = {}): Container {
  const useMocks = options.useMocks ?? readUseMocksFlag();

  // ClockPort is a platform primitive (not a backend capability): the real
  // system clock is bound in both modes. Tests inject a fake ClockPort directly.
  const clock: ClockPort = new SystemClock();
  // Notification delivery is platform-specific; mock mode replaces it below.
  const notificationAdapter: NotificationPort =
    Platform.OS === "web"
      ? new WebPushNotificationAdapter()
      : new ExpoNotificationAdapter();
  const fileShareAdapter: FileSharePort =
    Platform.OS === "web"
      ? new WebFileShareAdapter()
      : new ExpoFileShareAdapter();
  // Server-authoritative clock layered over the device clock. Unsynced until a
  // server timestamp arrives (offset 0 → serverNow === device now); the catalog
  // split + timers read through it so a later sync corrects everything at once.
  const serverClock = new ServerClock(clock);

  // TokenStorage is a platform primitive (like the clock): the native secure
  // store vs web in-memory choice is driven by Platform.OS, not the mock flag,
  // so it is bound in BOTH modes (RBT-023).
  const tokenStorage: TokenStorage = createTokenStorage();
  // Queue membership persistence is also a platform primitive (native secure
  // store vs web in-memory, driven by Platform.OS) → bound in BOTH modes (RBT-041).
  const queueMembership: QueueMembershipStorage =
    !useMocks && Platform.OS === "web"
      ? new WebQueueMembership()
      : createQueueMembershipStorage();
  // Idempotency keys are a client-side primitive over an in-memory store →
  // bound in BOTH modes (RBT-012/054).
  const idempotencyKeys = new IdempotencyKeys(
    useMocks
      ? new InMemoryIdempotencyStore()
      : new DurableIdempotencyStore(Platform.OS),
  );

  if (useMocks) {
    const mockBooking = new MockBookingRepository();
    const mockPayment = new MockPaymentRepository();
    return {
      clock,
      serverClock,
      tokenStorage,
      queueMembership,
      idempotencyKeys,
      httpClient: new MockHttpClient(),
      eventRepository: new MockEventRepository(),
      queueRepository: new MockQueueRepository(),
      bookingRepository: mockBooking,
      paymentRepository: mockPayment,
      userRepository: new MockUserRepository(),
      ticketHistoryRepository: new MockTicketHistoryRepository(
        async (bookingId) => {
          const status = await mockPayment.getStatus(bookingId, bookingId);
          return status.status === "PAID"
            ? mockBooking.getIssuedTickets(bookingId)
            : undefined;
        },
      ),
      notification: new MockNotificationAdapter(),
      pushSubscription: { register: async () => {}, remove: async () => {} },
      fileShare: fileShareAdapter,
    };
  }

  // Real wiring: HTTP repositories over fetch. It runs only when
  // EXPO_PUBLIC_USE_MOCKS is explicitly "false"/"0".
  const baseUrl = options.baseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
  if (baseUrl.length === 0) {
    throw new Error(
      "createContainer: EXPO_PUBLIC_API_BASE_URL is required for real adapters " +
        "(or set EXPO_PUBLIC_USE_MOCKS=true for mock wiring).",
    );
  }
  const visitorTokenStorage =
    Platform.OS === "web"
      ? new InMemoryTokenStorage()
      : new SecureStoreTokenStorage("rusuh.visitor.token");
  const refreshTokenStorage =
    Platform.OS === "web"
      ? new InMemoryTokenStorage()
      : new SecureStoreTokenStorage("rusuh.auth.refresh");
  const transport: HttpClient = new FetchHttpClient({
    baseUrl,
    getHeaders: async () => {
      const [accessToken, visitorToken] = await Promise.all([
        tokenStorage.load(),
        visitorTokenStorage.load(),
      ]);
      return {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(Platform.OS !== "web" && visitorToken
          ? { "X-Visitor-Token": visitorToken }
          : {}),
      };
    },
  });
  const httpClient: HttpClient = new RefreshingHttpClient(
    transport,
    tokenStorage,
    refreshTokenStorage,
  );
  return {
    clock,
    serverClock,
    tokenStorage,
    queueMembership,
    idempotencyKeys,
    httpClient,
    eventRepository: new HttpEventRepository(httpClient, serverClock),
    queueRepository: new HttpQueueRepository(httpClient, visitorTokenStorage),
    bookingRepository: new HttpBookingRepository(
      httpClient,
      Platform.OS === "web" && typeof globalThis.EventSource !== "undefined"
        ? (sessionId, onChange) => {
            const stream = new EventSource(
              `${baseUrl.replace(/\/+$/, "")}/booking-sessions/${encodeURIComponent(sessionId)}/stream`,
              { withCredentials: true },
            );
            stream.addEventListener("availability", onChange);
            return () => stream.close();
          }
        : undefined,
    ),
    paymentRepository: new HttpPaymentRepository(httpClient),
    userRepository: new HttpUserRepository(
      httpClient,
      tokenStorage,
      refreshTokenStorage,
    ),
    ticketHistoryRepository: new HttpTicketHistoryRepository(
      httpClient,
      tokenStorage,
    ),
    // Notification delivery and file sharing use platform adapters.
    notification: notificationAdapter,
    pushSubscription: new HttpPushSubscriptionAdapter(httpClient),
    fileShare: fileShareAdapter,
  };
}
