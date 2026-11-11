/**
 * Native NotificationPort implementation. Notifee handles local notifications
 * and local-notification taps; expo-notifications remains responsible for Expo
 * remote-push tokens and remote response events. SDK details stay in this
 * infrastructure adapter.
 */
import type {
  LocalNotification,
  NotificationPort,
} from "@domain/services/notification.port";
import Constants from "expo-constants";

type ExpoNotifications = typeof import("expo-notifications");
type ExpoNotificationResponses =
  typeof import("expo-notifications/build/NotificationsEmitter");
type NotifeeModule = typeof import("@notifee/react-native");

const ANDROID_CHANNEL_ID = "booking-updates";

function isExpoGo(): boolean {
  // `storeClient` also describes custom development builds. Only Expo Go has
  // `appOwnership === "expo"`; custom dev clients include native Notifee.
  return Constants.appOwnership === "expo";
}

export class ExpoNotificationAdapter implements NotificationPort {
  private channelId?: Promise<string>;
  private readonly localDeliveries = new Map<string, Promise<void>>();

  constructor(private readonly remotePushEnabled = true) {}

  private get notifeeApi(): NotifeeModule {
    // Keep native module loading lazy so importing the composition root in web
    // builds and tests does not load a native SDK.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@notifee/react-native") as NotifeeModule;
  }

  private get expoApi(): ExpoNotifications {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications") as ExpoNotifications;
  }

  private get responsesApi(): ExpoNotificationResponses {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications/build/NotificationsEmitter") as ExpoNotificationResponses;
  }

  async requestPermission(): Promise<boolean> {
    const { default: notifee, AuthorizationStatus } = this.notifeeApi;
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  }

  async registerForRemotePush(): Promise<string | null> {
    // Expo Go does not include this project's custom Notifee native module.
    // Development mock mode still requests local permission but skips remote
    // token registration.
    if (isExpoGo()) return null;
    try {
      if (!(await this.requestPermission())) return null;
      if (!this.remotePushEnabled) return null;
      const token = await this.expoApi.getExpoPushTokenAsync();
      return token.data;
    } catch {
      // Unsupported runtime, missing projectId, simulator, or offline.
      return null;
    }
  }

  subscribeToResponses(
    onResponse: (data: Readonly<Record<string, unknown>> | undefined) => void,
  ): () => void {
    let removeLocalListener = (): void => undefined;
    let removeExpoListener = (): void => undefined;

    try {
      const { default: notifee, EventType } = this.notifeeApi;
      removeLocalListener = notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
          onResponse(
            detail.notification?.data as
              | Readonly<Record<string, unknown>>
              | undefined,
          );
        }
      });

      // Android exposes cold-start notification data here. iOS sends the press
      // through onForegroundEvent instead.
      void notifee
        .getInitialNotification()
        .then((initial) => {
          if (initial) {
            onResponse(
              initial.notification.data as
                | Readonly<Record<string, unknown>>
                | undefined,
            );
          }
        })
        .catch(() => undefined);
    } catch {
      // Expo Go and some simulator runtimes do not expose the Notifee module.
    }

    try {
      const subscription =
        this.responsesApi.addNotificationResponseReceivedListener(
          (response) => {
            const data = response.notification.request.content.data as
              | Readonly<Record<string, unknown>>
              | undefined;
            onResponse(data);
          },
        );
      removeExpoListener = () => subscription.remove();
    } catch {
      // Remote notification taps are optional in unsupported runtimes.
    }

    return () => {
      removeLocalListener();
      removeExpoListener();
    };
  }

  async scheduleLocal(notification: LocalNotification): Promise<void> {
    const id = notification.notificationId;
    const existing = id ? this.localDeliveries.get(id) : undefined;
    if (existing) return existing;

    const delivery = this.deliverLocal(notification).catch((error: unknown) => {
      if (id) this.localDeliveries.delete(id);
      throw error;
    });
    if (id) this.localDeliveries.set(id, delivery);
    return delivery;
  }

  private async deliverLocal(notification: LocalNotification): Promise<void> {
    const {
      default: notifee,
      AndroidImportance,
      TriggerType,
    } = this.notifeeApi;
    this.channelId ??= notifee.createChannel({
      id: ANDROID_CHANNEL_ID,
      name: "Informasi pemesanan",
      description: "Pembaruan tiket dan pembayaran",
      importance: AndroidImportance.DEFAULT,
    });
    const channelId = await this.channelId;
    const content = {
      ...(notification.notificationId
        ? { id: notification.notificationId }
        : {}),
      title: notification.title,
      body: notification.body,
      data: {
        ...(notification.deepLink ? { deepLink: notification.deepLink } : {}),
        kind: notification.kind,
      },
      android: {
        channelId,
        pressAction: { id: "default" },
      },
      ios: {
        foregroundPresentationOptions: {
          alert: true,
          badge: false,
          sound: true,
        },
      },
    };

    if (notification.scheduledAtMs && notification.scheduledAtMs > Date.now()) {
      await notifee.createTriggerNotification(content, {
        type: TriggerType.TIMESTAMP,
        timestamp: notification.scheduledAtMs,
      });
      return;
    }
    await notifee.displayNotification(content);
  }
}
