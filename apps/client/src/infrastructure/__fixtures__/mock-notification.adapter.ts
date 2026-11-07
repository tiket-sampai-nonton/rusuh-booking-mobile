/**
 * MockNotificationAdapter — no-op adapter for `NotificationPort`.
 *
 * Bound under `EXPO_PUBLIC_USE_MOCKS`. Framework-free; records calls so a demo
 * or test can assert the shared notification flow fired without touching the OS
 * or browser permission prompts.
 */
import type {
  LocalNotification,
  NotificationPort,
} from "@domain/services/notification.port";

export class MockNotificationAdapter implements NotificationPort {
  readonly scheduled: LocalNotification[] = [];

  async requestPermission(): Promise<boolean> {
    return true;
  }

  async scheduleLocal(notification: LocalNotification): Promise<void> {
    this.scheduled.push(notification);
  }

  async registerForRemotePush(): Promise<string | null> {
    return "mock-push-token";
  }
}
