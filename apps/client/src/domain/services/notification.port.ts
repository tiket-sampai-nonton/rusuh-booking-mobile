/**
 * NotificationPort — domain PORT (ARCHITECTURE §2.1 ISP, §6.1).
 *
 * Pure TS interface: no React / React Native / Expo / browser / native imports.
 * Infrastructure adapters implement it per platform (`expo-notifications` on
 * native, web-push on web). The shared domain notification flow does not change
 * between platforms; only the bound adapter does.
 */

/** Minimal local-notification request placeholder — refined in RBT-072. */
export interface LocalNotification {
  readonly title: string;
  readonly body: string;
  /** Epoch-ms time to fire; omitted means immediate. */
  readonly scheduledAtMs?: number;
}

export interface NotificationPort {
  /** Request OS/browser permission to show notifications. */
  requestPermission(): Promise<boolean>;
  /** Schedule (or immediately show) a local notification. */
  scheduleLocal(notification: LocalNotification): Promise<void>;
  /** Register the device/browser for remote push and return its token. */
  registerForRemotePush(): Promise<string | null>;
}
