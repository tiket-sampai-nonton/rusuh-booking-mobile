/**
 * ExpoNotificationAdapter — native `NotificationPort` over expo-notifications
 * (RBT-072, E8, AC1). The ONLY layer that touches the native notification SDK.
 *
 * Bound at the composition root on native (iOS/Android); web uses the web-push
 * adapter (RBT-073) and dev uses the mock. The shared notification FLOW
 * (notification-flows rule) is platform-neutral — this adapter only delivers it:
 * requests OS permission, registers for remote push (Expo token), and schedules
 * a local notification carrying its `deepLink` in the payload so a tap can route
 * (the tap→route wiring lives in useNotifications).
 */
import type {
  LocalNotification,
  NotificationPort,
} from "@domain/services/notification.port";

type ExpoNotifications = typeof import("expo-notifications");

export class ExpoNotificationAdapter implements NotificationPort {
  // expo-notifications is required lazily so importing this module (e.g. on the
  // composition-root type graph) never pulls the native SDK on web/test.
  private get api(): ExpoNotifications {
    return require("expo-notifications") as ExpoNotifications;
  }

  async requestPermission(): Promise<boolean> {
    const current = await this.api.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await this.api.requestPermissionsAsync();
    return asked.granted;
  }

  async registerForRemotePush(): Promise<string | null> {
    if (!(await this.requestPermission())) return null;
    try {
      const token = await this.api.getExpoPushTokenAsync();
      return token.data;
    } catch {
      // No projectId / simulator / offline — degrade to no remote token; local
      // notifications still work.
      return null;
    }
  }

  async scheduleLocal(notification: LocalNotification): Promise<void> {
    const content = {
      title: notification.title,
      body: notification.body,
      // The deep link + kind travel in data so the tap handler can route.
      data: { deepLink: notification.deepLink, kind: notification.kind },
    };
    if (notification.scheduledAtMs && notification.scheduledAtMs > Date.now()) {
      await this.api.scheduleNotificationAsync({
        content,
        trigger: { date: new Date(notification.scheduledAtMs) } as never,
      });
      return;
    }
    // Immediate.
    await this.api.scheduleNotificationAsync({ content, trigger: null });
  }
}
