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
import Constants from "expo-constants";

type ExpoNotifications = typeof import("expo-notifications");
type ExpoNotificationPermissions =
  typeof import("expo-notifications/build/NotificationPermissions");
type ExpoNotificationResponses =
  typeof import("expo-notifications/build/NotificationsEmitter");
type ExpoNotificationScheduler =
  typeof import("expo-notifications/build/scheduleNotificationAsync");

function isExpoGo(): boolean {
  return (
    Constants.appOwnership === "expo" ||
    Constants.executionEnvironment === "storeClient" ||
    Constants.expoVersion !== null
  );
}

export class ExpoNotificationAdapter implements NotificationPort {
  // expo-notifications is required lazily so importing this module (e.g. on the
  // composition-root type graph) never pulls the native SDK on web/test.
  private get api(): ExpoNotifications {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications") as ExpoNotifications;
  }

  private get permissionsApi(): ExpoNotificationPermissions {
    // Use the specific module so loading local notifications does not load the
    // package barrel's Expo Go remote-push auto-registration side effect.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications/build/NotificationPermissions") as ExpoNotificationPermissions;
  }

  private get responsesApi(): ExpoNotificationResponses {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications/build/NotificationsEmitter") as ExpoNotificationResponses;
  }

  private get schedulerApi(): ExpoNotificationScheduler {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications/build/scheduleNotificationAsync") as ExpoNotificationScheduler;
  }

  async requestPermission(): Promise<boolean> {
    const current = await this.permissionsApi.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await this.permissionsApi.requestPermissionsAsync();
    return asked.granted;
  }

  async registerForRemotePush(): Promise<string | null> {
    if (isExpoGo()) {
      // Expo Go does not support remote push on SDK 53+; avoid calling the
      // native API, which reports this limitation as a runtime error.
      return null;
    }
    try {
      if (!(await this.requestPermission())) return null;
      const token = await this.api.getExpoPushTokenAsync();
      return token.data;
    } catch {
      // Unsupported runtime (such as Expo Go on SDK 53), no projectId,
      // simulator, or offline — degrade to no remote token.
      return null;
    }
  }

  subscribeToResponses(
    onResponse: (data: Readonly<Record<string, unknown>> | undefined) => void,
  ): () => void {
    try {
      // In-app/local notifications are available in Expo Go even though remote
      // push token registration is not.
      const subscription =
        this.responsesApi.addNotificationResponseReceivedListener(
          (response) => {
            const data = response.notification.request.content.data as
              | Readonly<Record<string, unknown>>
              | undefined;
            onResponse(data);
          },
        );
      return () => subscription.remove();
    } catch {
      // Some native runtimes do not expose notification response listeners.
      return () => undefined;
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
      await this.schedulerApi.default({
        content,
        trigger: { date: new Date(notification.scheduledAtMs) } as never,
      });
      return;
    }
    // Immediate.
    await this.schedulerApi.default({ content, trigger: null });
  }
}
