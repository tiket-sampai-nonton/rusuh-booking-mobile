/**
 * Composition root — manual Dependency Injection (ARCHITECTURE §2.1 DIP, §3,
 * §11.7 D2). NO DI library: a plain factory constructs adapters and binds them
 * to domain ports. This is the ONLY place concrete adapters are wired.
 *
 * `EXPO_PUBLIC_USE_MOCKS` selects mock vs real adapters. Real adapters do not
 * exist yet (RBT-010 builds the HTTP repositories, RBT-014 the fixtures, the
 * E8 tasks the platform adapters); the non-mock branch is a clearly-marked TODO
 * until then.
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
import type { ClockPort } from "@domain/services/clock.port";
import type { FileSharePort } from "@domain/services/file-share.port";
import type { NotificationPort } from "@domain/services/notification.port";
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
import { ExpoFileShareAdapter } from "@infrastructure/files/expo-file-share.adapter";
import { WebFileShareAdapter } from "@infrastructure/files/web-file-share.adapter";
import { FetchHttpClient } from "@infrastructure/http/fetch-http-client";
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
 * `"false"`/`"0"` → real; anything else (incl. UNSET) → mocks. RBT-004 defaults
 * UNSET to mocks because the real adapters do not exist yet and the
 * `__fixtures__` adapters are the documented dev/demo default (ARCHITECTURE §3).
 * TODO(RBT-010): once the real HTTP repositories land, flip the default so an
 * unset flag resolves to REAL and only `EXPO_PUBLIC_USE_MOCKS=true` picks mocks.
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
 * demoable with no backend. Real mode is not wired yet — see the TODO.
 */
export function createContainer(options: ContainerOptions = {}): Container {
  const useMocks = options.useMocks ?? readUseMocksFlag();

  // ClockPort is a platform primitive (not a backend capability): the real
  // system clock is bound in both modes. Tests inject a fake ClockPort directly.
  const clock: ClockPort = new SystemClock();
  // Notification adapter is a platform primitive (like the clock): native uses
  // expo-notifications (RBT-072); web uses the mock until web-push (RBT-073)
  // lands; the dev/test mock is used when mocks are on. Bound in both modes.
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
    createQueueMembershipStorage();
  // Idempotency keys are a client-side primitive over an in-memory store →
  // bound in BOTH modes (RBT-012/054).
  const idempotencyKeys = new IdempotencyKeys(new InMemoryIdempotencyStore());

  if (useMocks) {
    return {
      clock,
      serverClock,
      tokenStorage,
      queueMembership,
      idempotencyKeys,
      httpClient: new MockHttpClient(),
      eventRepository: new MockEventRepository(),
      queueRepository: new MockQueueRepository(),
      bookingRepository: new MockBookingRepository(),
      paymentRepository: new MockPaymentRepository(),
      userRepository: new MockUserRepository(),
      ticketHistoryRepository: new MockTicketHistoryRepository(),
      notification: new MockNotificationAdapter(),
      fileShare: fileShareAdapter,
    };
  }

  // REAL wiring (RBT-010): HTTP repositories over the fetch transport. Note the
  // app still DEFAULTS to mocks (unset EXPO_PUBLIC_USE_MOCKS → mocks) because the
  // real BE is not reachable and the FE-NEED gaps (O1) aren't delivered; this
  // branch runs only when EXPO_PUBLIC_USE_MOCKS is explicitly "false"/"0".
  // Platform adapters (notification/fileShare) still come from E8/E6 — until
  // then they fall back to the mock adapters here.
  const baseUrl = options.baseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
  if (baseUrl.length === 0) {
    throw new Error(
      "createContainer: EXPO_PUBLIC_API_BASE_URL is required for real adapters " +
        "(or set EXPO_PUBLIC_USE_MOCKS=true for mock wiring).",
    );
  }
  const httpClient: HttpClient = new FetchHttpClient({ baseUrl });
  return {
    clock,
    serverClock,
    tokenStorage,
    queueMembership,
    idempotencyKeys,
    httpClient,
    eventRepository: new HttpEventRepository(httpClient, serverClock),
    queueRepository: new HttpQueueRepository(httpClient),
    bookingRepository: new HttpBookingRepository(httpClient),
    paymentRepository: new HttpPaymentRepository(httpClient),
    userRepository: new HttpUserRepository(httpClient, tokenStorage),
    ticketHistoryRepository: new HttpTicketHistoryRepository(
      httpClient,
      tokenStorage,
    ),
    // RBT-072: native uses expo-notifications; web falls back to the mock until
    // web-push (RBT-073). fileShare is bound in E6.
    notification: notificationAdapter,
    fileShare: fileShareAdapter,
  };
}
