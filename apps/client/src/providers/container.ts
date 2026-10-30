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
import type { BookingRepository } from "@domain/repositories/booking.repository";
import type { EventRepository } from "@domain/repositories/event.repository";
import type { PaymentRepository } from "@domain/repositories/payment.repository";
import type { QueueRepository } from "@domain/repositories/queue.repository";
import type { UserRepository } from "@domain/repositories/user.repository";
import { IdempotencyKeys } from "@domain/idempotency/idempotency-key";
import type { ClockPort } from "@domain/services/clock.port";
import type { FileSharePort } from "@domain/services/file-share.port";
import type { NotificationPort } from "@domain/services/notification.port";
import { ServerClock } from "@domain/services/server-clock";
import { InMemoryIdempotencyStore } from "@infrastructure/__fixtures__/in-memory-idempotency-store";
import { HttpBookingRepository } from "@infrastructure/api/http-booking.repository";
import { HttpEventRepository } from "@infrastructure/api/http-event.repository";
import { HttpPaymentRepository } from "@infrastructure/api/http-payment.repository";
import { HttpQueueRepository } from "@infrastructure/api/http-queue.repository";
import { HttpUserRepository } from "@infrastructure/api/http-user.repository";
import { MockBookingRepository } from "@infrastructure/__fixtures__/mock-booking.repository";
import { MockEventRepository } from "@infrastructure/__fixtures__/mock-event.repository";
import { MockFileShareAdapter } from "@infrastructure/__fixtures__/mock-file-share.adapter";
import { MockHttpClient } from "@infrastructure/__fixtures__/mock-http-client";
import { MockNotificationAdapter } from "@infrastructure/__fixtures__/mock-notification.adapter";
import { MockPaymentRepository } from "@infrastructure/__fixtures__/mock-payment.repository";
import { MockQueueRepository } from "@infrastructure/__fixtures__/mock-queue.repository";
import { MockUserRepository } from "@infrastructure/__fixtures__/mock-user.repository";
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
   * Server-authoritative clock (RBT-011) layered over `clock`. Use cases read
   * this (not the raw `ClockPort`) for all timer / date-window math so a skewed
   * device clock never leaks into booking/payment deadlines.
   */
  readonly serverClock: ServerClock;
  /**
   * Idempotency-Key manager (RBT-012): mints one key per logical action and
   * reuses it across retry/refresh so a double-submit cannot create a second
   * booking/payment. Backed by an in-memory store (dev); a durable adapter is
   * swapped at the composition root for cross-restart persistence.
   */
  readonly idempotencyKeys: IdempotencyKeys;
  readonly httpClient: HttpClient;
  readonly eventRepository: EventRepository;
  readonly queueRepository: QueueRepository;
  readonly bookingRepository: BookingRepository;
  readonly paymentRepository: PaymentRepository;
  readonly userRepository: UserRepository;
  readonly notification: NotificationPort;
  readonly fileShare: FileSharePort;
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
  const serverClock = new ServerClock(clock);
  const idempotencyKeys = new IdempotencyKeys(new InMemoryIdempotencyStore());

  if (useMocks) {
    return {
      clock,
      serverClock,
      idempotencyKeys,
      httpClient: new MockHttpClient(),
      eventRepository: new MockEventRepository(),
      queueRepository: new MockQueueRepository(),
      bookingRepository: new MockBookingRepository(),
      paymentRepository: new MockPaymentRepository(),
      userRepository: new MockUserRepository(),
      notification: new MockNotificationAdapter(),
      fileShare: new MockFileShareAdapter(),
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
    idempotencyKeys,
    httpClient,
    eventRepository: new HttpEventRepository(httpClient),
    queueRepository: new HttpQueueRepository(httpClient),
    bookingRepository: new HttpBookingRepository(httpClient),
    paymentRepository: new HttpPaymentRepository(httpClient),
    userRepository: new HttpUserRepository(httpClient),
    // Platform adapters are not part of RBT-010 — bound in E6/E8. Until then
    // the mock adapters keep the container complete without faking a backend.
    notification: new MockNotificationAdapter(),
    fileShare: new MockFileShareAdapter(),
  };
}
