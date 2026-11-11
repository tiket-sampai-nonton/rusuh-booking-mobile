/** Native NotificationPort: Notifee local delivery plus Expo remote token. */
import { ExpoNotificationAdapter } from "@infrastructure/notifications/expo-notification.adapter";

const mockLocalListener = jest.fn();
const mockRemoveLocalListener = jest.fn();
const mockRemoveExpoListener = jest.fn();

jest.mock("expo-constants", () => ({
  appOwnership: null,
  executionEnvironment: "standalone",
  expoVersion: null,
}));
jest.mock("expo-notifications", () => ({
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({
    data: "ExpoPushToken[xyz]",
  }),
}));
jest.mock("expo-notifications/build/NotificationsEmitter", () => ({
  addNotificationResponseReceivedListener: jest
    .fn()
    .mockReturnValue({ remove: mockRemoveExpoListener }),
}));
jest.mock("@notifee/react-native", () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
    createChannel: jest.fn().mockResolvedValue("booking-updates"),
    displayNotification: jest.fn().mockResolvedValue("notification-id"),
    createTriggerNotification: jest.fn().mockResolvedValue("trigger-id"),
    onForegroundEvent: jest.fn().mockImplementation((handler) => {
      mockLocalListener.mockImplementation(handler);
      return mockRemoveLocalListener;
    }),
    getInitialNotification: jest.fn().mockResolvedValue(null),
  },
  AuthorizationStatus: { DENIED: 0, AUTHORIZED: 1, PROVISIONAL: 2 },
  AndroidImportance: { DEFAULT: 3 },
  TriggerType: { TIMESTAMP: 0 },
  EventType: { PRESS: 1, ACTION_PRESS: 2 },
}));

const ExpoConstants = jest.requireMock("expo-constants") as {
  appOwnership: string | null;
  executionEnvironment: string;
  expoVersion: string | null;
};
const Notifee = jest.requireMock("@notifee/react-native") as {
  default: {
    requestPermission: jest.Mock;
    createChannel: jest.Mock;
    displayNotification: jest.Mock;
    createTriggerNotification: jest.Mock;
    onForegroundEvent: jest.Mock;
    getInitialNotification: jest.Mock;
  };
};
const ExpoResponses = jest.requireMock(
  "expo-notifications/build/NotificationsEmitter",
) as { addNotificationResponseReceivedListener: jest.Mock };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ExpoNotifications = require("expo-notifications") as {
  getExpoPushTokenAsync: jest.Mock;
};

describe("ExpoNotificationAdapter (Notifee local notifications)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ExpoConstants.appOwnership = null;
    ExpoConstants.executionEnvironment = "standalone";
    ExpoConstants.expoVersion = null;
    Notifee.default.requestPermission.mockResolvedValue({
      authorizationStatus: 1,
    });
    Notifee.default.createChannel.mockResolvedValue("booking-updates");
    Notifee.default.displayNotification.mockResolvedValue("notification-id");
    Notifee.default.createTriggerNotification.mockResolvedValue("trigger-id");
    Notifee.default.getInitialNotification.mockResolvedValue(null);
    ExpoNotifications.getExpoPushTokenAsync.mockResolvedValue({
      data: "ExpoPushToken[xyz]",
    });
    ExpoResponses.addNotificationResponseReceivedListener.mockReturnValue({
      remove: mockRemoveExpoListener,
    });
  });

  it("requests OS notification permission through Notifee", async () => {
    const adapter = new ExpoNotificationAdapter();
    await expect(adapter.requestPermission()).resolves.toBe(true);
    expect(Notifee.default.requestPermission).toHaveBeenCalledTimes(1);
  });

  it("returns false when permission is denied", async () => {
    Notifee.default.requestPermission.mockResolvedValue({
      authorizationStatus: 0,
    });
    await expect(
      new ExpoNotificationAdapter().requestPermission(),
    ).resolves.toBe(false);
  });

  it("registers remote push using Expo only when enabled and permitted", async () => {
    const adapter = new ExpoNotificationAdapter();
    await expect(adapter.registerForRemotePush()).resolves.toBe(
      "ExpoPushToken[xyz]",
    );
    expect(ExpoNotifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
  });

  it("does not register remote push in mock mode", async () => {
    const adapter = new ExpoNotificationAdapter(false);
    await expect(adapter.registerForRemotePush()).resolves.toBeNull();
    expect(Notifee.default.requestPermission).toHaveBeenCalledTimes(1);
    expect(ExpoNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it("skips the unsupported Expo Go remote-push API", async () => {
    ExpoConstants.appOwnership = "expo";
    ExpoConstants.executionEnvironment = "storeClient";
    await expect(
      new ExpoNotificationAdapter().registerForRemotePush(),
    ).resolves.toBeNull();
    expect(Notifee.default.requestPermission).not.toHaveBeenCalled();
  });

  it("still requests local permission in a standalone build with an Expo SDK version", async () => {
    ExpoConstants.expoVersion = "53.0.0";
    await expect(
      new ExpoNotificationAdapter(false).registerForRemotePush(),
    ).resolves.toBeNull();
    expect(Notifee.default.requestPermission).toHaveBeenCalledTimes(1);
    expect(ExpoNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it("requests permission in a custom development client", async () => {
    ExpoConstants.executionEnvironment = "storeClient";
    const adapter = new ExpoNotificationAdapter(false);
    await expect(adapter.registerForRemotePush()).resolves.toBeNull();
    expect(Notifee.default.requestPermission).toHaveBeenCalledTimes(1);
  });

  it("shows an immediate notification with stable ID and route data", async () => {
    const adapter = new ExpoNotificationAdapter();
    const message = {
      kind: "payment_success",
      notificationId: "payment-success-bk-1",
      title: "Pembayaran berhasil",
      body: "Tiketmu aktif.",
      deepLink: "/success/bk-1",
    } as const;
    await adapter.scheduleLocal(message);
    await adapter.scheduleLocal(message);

    expect(Notifee.default.createChannel).toHaveBeenCalledWith(
      expect.objectContaining({ id: "booking-updates" }),
    );
    expect(Notifee.default.displayNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "payment-success-bk-1",
        title: "Pembayaran berhasil",
        data: {
          deepLink: "/success/bk-1",
          kind: "payment_success",
        },
        android: expect.objectContaining({
          channelId: "booking-updates",
          pressAction: { id: "default" },
        }),
      }),
    );
    expect(Notifee.default.displayNotification).toHaveBeenCalledTimes(1);
  });

  it("schedules future notifications through a Notifee timestamp trigger", async () => {
    const future = Date.now() + 60_000;
    await new ExpoNotificationAdapter().scheduleLocal({
      kind: "expiry_reminder",
      title: "T",
      body: "B",
      scheduledAtMs: future,
    });
    expect(Notifee.default.createTriggerNotification).toHaveBeenCalledWith(
      expect.any(Object),
      { type: 0, timestamp: future },
    );
  });

  it("routes local notification presses and unsubscribes", () => {
    const onResponse = jest.fn();
    const unsubscribe = new ExpoNotificationAdapter().subscribeToResponses(
      onResponse,
    );
    mockLocalListener({
      type: 1,
      detail: { notification: { data: { deepLink: "/success/bk-1" } } },
    });
    unsubscribe();

    expect(onResponse).toHaveBeenCalledWith({ deepLink: "/success/bk-1" });
    expect(mockRemoveLocalListener).toHaveBeenCalled();
    expect(mockRemoveExpoListener).toHaveBeenCalled();
  });

  it("routes a cold-start Notifee notification", async () => {
    const onResponse = jest.fn();
    Notifee.default.getInitialNotification.mockResolvedValue({
      notification: { data: { deepLink: "/payment/bk-1" } },
    });
    new ExpoNotificationAdapter().subscribeToResponses(onResponse);
    await Promise.resolve();
    await Promise.resolve();
    expect(onResponse).toHaveBeenCalledWith({ deepLink: "/payment/bk-1" });
  });
});
