/**
 * WebPushNotificationAdapter — web `NotificationPort` over the browser
 * Notification / Push APIs + a service worker (RBT-073, E8, AC1, D8.2).
 *
 * The web counterpart of RBT-072's ExpoNotificationAdapter: it sits behind the
 * SAME shared notification flow (notification-flows rule) and delivers the SAME
 * required flows. It FEATURE-DETECTS and DEGRADES gracefully — on a browser
 * without Notification / serviceWorker / PushManager it reports no permission /
 * no token and shows nothing, rather than throwing (D8.2).
 *
 * The browser globals are read through a small injected surface so the adapter
 * is unit-testable in jsdom/node without a real SW.
 */
import type {
  LocalNotification,
  NotificationPort,
} from "@domain/services/notification.port";

/** The browser capabilities this adapter needs — injected for tests. */
export interface WebPushEnv {
  readonly hasNotification: boolean;
  readonly hasServiceWorker: boolean;
  readonly hasPushManager: boolean;
  requestPermission(): Promise<NotificationPermission>;
  currentPermission(): NotificationPermission;
  registerServiceWorker(url: string): Promise<WebPushRegistration | null>;
  showViaRegistration(
    title: string,
    options: { body: string; data: unknown; tag?: string },
  ): Promise<boolean>;
}

export interface WebPushRegistration {
  subscribe(): Promise<string | null>;
}

/** True when the browser supports the full web-push stack. */
export function webPushSupported(
  env: Pick<
    WebPushEnv,
    "hasNotification" | "hasServiceWorker" | "hasPushManager"
  >,
): boolean {
  return env.hasNotification && env.hasServiceWorker && env.hasPushManager;
}

export class WebPushNotificationAdapter implements NotificationPort {
  subscribeToResponses(): () => void {
    // Web taps are routed by the service worker's notificationclick handler.
    return () => undefined;
  }

  constructor(private readonly env: WebPushEnv = defaultWebPushEnv()) {}

  async requestPermission(): Promise<boolean> {
    if (!this.env.hasNotification) return false; // degrade
    if (this.env.currentPermission() === "granted") return true;
    if (this.env.currentPermission() === "denied") return false;
    return (await this.env.requestPermission()) === "granted";
  }

  async registerForRemotePush(): Promise<string | null> {
    if (!webPushSupported(this.env)) return null; // degrade — no push stack
    if (!(await this.requestPermission())) return null;
    const reg = await this.env.registerServiceWorker("/sw.js");
    if (!reg) return null;
    return reg.subscribe();
  }

  async scheduleLocal(notification: LocalNotification): Promise<void> {
    if (!this.env.hasNotification) return; // degrade silently
    if (!(await this.requestPermission())) return;
    // The browser cannot schedule a future local notification without the SW +
    // the Push service, so a scheduled flow is delivered by the BE push; here we
    // show immediately when asked (the shared flow decides WHEN to call).
    await this.env.showViaRegistration(notification.title, {
      body: notification.body,
      data: { deepLink: notification.deepLink, kind: notification.kind },
      tag: notification.kind,
    });
  }
}

/** Real browser environment (web runtime). Guards every global access. */
export function defaultWebPushEnv(): WebPushEnv {
  const g = globalThis as unknown as {
    Notification?: {
      permission: NotificationPermission;
      requestPermission(): Promise<NotificationPermission>;
    };
    navigator?: {
      serviceWorker?: {
        register(url: string): Promise<{
          pushManager?: {
            subscribe(opts: unknown): Promise<{ endpoint?: string }>;
          };
          showNotification(title: string, options: unknown): Promise<void>;
        }>;
      };
    };
    PushManager?: unknown;
  };
  const hasNotification = typeof g.Notification !== "undefined";
  const hasServiceWorker = !!g.navigator?.serviceWorker;
  const hasPushManager = typeof g.PushManager !== "undefined";
  return {
    hasNotification,
    hasServiceWorker,
    hasPushManager,
    currentPermission: () => g.Notification?.permission ?? "denied",
    requestPermission: () =>
      g.Notification?.requestPermission() ?? Promise.resolve("denied"),
    async registerServiceWorker(url) {
      if (!g.navigator?.serviceWorker) return null;
      const reg = await g.navigator.serviceWorker.register(url);
      return {
        async subscribe() {
          try {
            const sub = await reg.pushManager?.subscribe({
              userVisibleOnly: true,
            });
            return sub?.endpoint ?? null;
          } catch {
            return null;
          }
        },
      };
    },
    async showViaRegistration(title, options) {
      const reg = await g.navigator?.serviceWorker?.register("/sw.js");
      if (reg) {
        await reg.showNotification(title, options);
        return true;
      }
      return false;
    },
  };
}
