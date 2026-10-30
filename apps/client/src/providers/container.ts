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
import type { EventRepository } from "@domain/repositories/event.repository";
import type { PaymentRepository } from "@domain/repositories/payment.repository";
import type { QueueRepository } from "@domain/repositories/queue.repository";
import type { ClockPort } from "@domain/services/clock.port";
import type { FileSharePort } from "@domain/services/file-share.port";
import type { NotificationPort } from "@domain/services/notification.port";
import { MockEventRepository } from "@infrastructure/__fixtures__/mock-event.repository";
import { MockFileShareAdapter } from "@infrastructure/__fixtures__/mock-file-share.adapter";
import { MockHttpClient } from "@infrastructure/__fixtures__/mock-http-client";
import { MockNotificationAdapter } from "@infrastructure/__fixtures__/mock-notification.adapter";
import { MockPaymentRepository } from "@infrastructure/__fixtures__/mock-payment.repository";
import { MockQueueRepository } from "@infrastructure/__fixtures__/mock-queue.repository";
import type { HttpClient } from "@infrastructure/http/http-client";
import { SystemClock } from "@infrastructure/time/system-clock";

/**
 * The container: every domain port bound to one concrete adapter. Hooks read
 * these through `service-context.tsx`; nothing else constructs adapters.
 */
export interface Container {
  readonly clock: ClockPort;
  readonly httpClient: HttpClient;
  readonly eventRepository: EventRepository;
  readonly queueRepository: QueueRepository;
  readonly paymentRepository: PaymentRepository;
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

  if (useMocks) {
    return {
      clock,
      httpClient: new MockHttpClient(),
      eventRepository: new MockEventRepository(),
      queueRepository: new MockQueueRepository(),
      paymentRepository: new MockPaymentRepository(),
      notification: new MockNotificationAdapter(),
      fileShare: new MockFileShareAdapter(),
    };
  }

  // TODO(RBT-010/RBT-014/E8): bind the REAL adapters here, e.g.
  //   const httpClient = new AxiosHttpClient(baseUrl);               // RBT-010
  //   const eventRepository = new HttpEventRepository(httpClient);   // RBT-010
  //   const queueRepository = new HttpQueueRepository(httpClient);   // RBT-010
  //   const paymentRepository = new HttpPaymentRepository(httpClient);// RBT-010 (mock→real swap, §13 P5)
  //   const notification = new ExpoNotificationAdapter();            // RBT-072 (.native.ts / .web.ts)
  //   const fileShare = new ExpoFileShareAdapter();                  // E6
  // Until those exist, refuse to pretend the app can talk to a backend.
  throw new Error(
    "createContainer: real adapters are not wired yet — set EXPO_PUBLIC_USE_MOCKS=true " +
      "until RBT-010/RBT-014 land the HTTP repositories and fixtures.",
  );
}
