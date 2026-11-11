/**
 * NotificationPort — domain PORT (ARCHITECTURE §2.1 ISP, §6.1).
 *
 * Pure TS interface: no React / React Native / Expo / browser / native imports.
 * Infrastructure adapters implement it per platform (Notifee for native local
 * notifications with Expo Notifications for remote tokens, web-push on web).
 * The shared domain notification flow does not change between platforms; only
 * the bound adapter does.
 */

/** The required notification flows (RBT-072 AC1). */
export type NotificationKind =
  | "expiry_reminder" // hold/payment deadline is near
  | "payment_success" // booking paid & confirmed
  | "payment_failure" // payment attempt ended without payment
  | "payment_cancelled" // buyer left the payment flow
  | "waiting_room_left" // buyer left the queue
  | "admission" // queue admitted — your turn
  | "event_reminder"; // event starts soon

/** A local notification + the in-app route a tap should deep-link to. */
export interface LocalNotification {
  readonly kind: NotificationKind;
  /** Stable per outcome so repeated authoritative reads update one alert. */
  readonly notificationId?: string;
  readonly title: string;
  readonly body: string;
  /** Epoch-ms time to fire; omitted means immediate. */
  readonly scheduledAtMs?: number;
  /** In-app route a tap opens (e.g. `/payment/bk-1`, `/success/bk-1`). */
  readonly deepLink?: string;
}

export interface NotificationPort {
  /** Request OS/browser permission to show notifications. */
  requestPermission(): Promise<boolean>;
  /** Schedule (or immediately show) a local notification. */
  scheduleLocal(notification: LocalNotification): Promise<void>;
  /** Register the device/browser for remote push and return its token. */
  registerForRemotePush(): Promise<string | null>;
  /** Subscribe to in-app notification taps; returns an unsubscribe function. */
  subscribeToResponses(
    onResponse: (data: Readonly<Record<string, unknown>> | undefined) => void,
  ): () => void;
}
