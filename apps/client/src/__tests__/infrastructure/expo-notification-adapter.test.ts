/**
 * RBT-072 — ExpoNotificationAdapter over the (mocked) expo-notifications SDK.
 */
import { ExpoNotificationAdapter } from "@infrastructure/notifications/expo-notification.adapter";

jest.mock("expo-constants", () => ({
  appOwnership: null,
  executionEnvironment: "standalone",
  expoVersion: null,
}));
jest.mock("expo-notifications/build/NotificationPermissions", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
}));
jest.mock("expo-notifications/build/NotificationsEmitter", () => ({
  addNotificationResponseReceivedListener: jest
    .fn()
    .mockReturnValue({ remove: jest.fn() }),
}));
jest.mock("expo-notifications/build/scheduleNotificationAsync", () => ({
  default: jest.fn().mockResolvedValue("id"),
}));
const ExpoConstants = jest.requireMock("expo-constants") as {
  appOwnership: string | null;
  executionEnvironment: string;
  expoVersion: string | null;
};
const Permissions = jest.requireMock(
  "expo-notifications/build/NotificationPermissions",
) as {
  getPermissionsAsync: jest.Mock;
  requestPermissionsAsync: jest.Mock;
};
const Responses = jest.requireMock(
  "expo-notifications/build/NotificationsEmitter",
) as {
  addNotificationResponseReceivedListener: jest.Mock;
};
const Scheduler = jest.requireMock(
  "expo-notifications/build/scheduleNotificationAsync",
) as { default: jest.Mock };

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Notifications = require("expo-notifications") as {
  getExpoPushTokenAsync: jest.Mock;
};

describe("ExpoNotificationAdapter (RBT-072)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ExpoConstants.appOwnership = null;
    ExpoConstants.executionEnvironment = "standalone";
    ExpoConstants.expoVersion = null;
    Permissions.getPermissionsAsync.mockResolvedValue({ granted: true });
    Permissions.requestPermissionsAsync.mockResolvedValue({ granted: true });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: "ExpoPushToken[xyz]",
    });
    Scheduler.default.mockResolvedValue("id");
  });

  it("requestPermission: granted current permission needs no prompt", async () => {
    const a = new ExpoNotificationAdapter();
    expect(await a.requestPermission()).toBe(true);
    expect(Permissions.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it("requestPermission: prompts when not already granted", async () => {
    Permissions.getPermissionsAsync.mockResolvedValue({ granted: false });
    Permissions.requestPermissionsAsync.mockResolvedValue({ granted: true });
    const a = new ExpoNotificationAdapter();
    expect(await a.requestPermission()).toBe(true);
    expect(Permissions.requestPermissionsAsync).toHaveBeenCalled();
  });

  it("registerForRemotePush: returns the Expo token when permitted", async () => {
    const a = new ExpoNotificationAdapter();
    expect(await a.registerForRemotePush()).toBe("ExpoPushToken[xyz]");
  });

  it("registerForRemotePush: null when permission denied", async () => {
    Permissions.getPermissionsAsync.mockResolvedValue({ granted: false });
    Permissions.requestPermissionsAsync.mockResolvedValue({ granted: false });
    const a = new ExpoNotificationAdapter();
    expect(await a.registerForRemotePush()).toBeNull();
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it("registerForRemotePush: null (not throw) when token mint fails", async () => {
    Notifications.getExpoPushTokenAsync.mockRejectedValue(
      new Error("no projectId"),
    );
    const a = new ExpoNotificationAdapter();
    expect(await a.registerForRemotePush()).toBeNull();
  });

  it("registerForRemotePush: null when the runtime does not support permissions", async () => {
    Permissions.getPermissionsAsync.mockRejectedValue(
      new Error("Remote notifications are unavailable in Expo Go"),
    );
    const a = new ExpoNotificationAdapter();
    await expect(a.registerForRemotePush()).resolves.toBeNull();
  });

  it("registerForRemotePush: skips the unsupported Expo Go remote-push API", async () => {
    ExpoConstants.executionEnvironment = "storeClient";
    const a = new ExpoNotificationAdapter();
    await expect(a.registerForRemotePush()).resolves.toBeNull();
    expect(Permissions.getPermissionsAsync).not.toHaveBeenCalled();
  });

  it("detects Expo Go from its runtime version when other flags are absent", async () => {
    ExpoConstants.expoVersion = "53.0.0";
    const a = new ExpoNotificationAdapter();

    await expect(a.registerForRemotePush()).resolves.toBeNull();
    expect(Permissions.getPermissionsAsync).not.toHaveBeenCalled();
  });

  it("keeps local notification tap listeners available in Expo Go", () => {
    ExpoConstants.executionEnvironment = "storeClient";
    const a = new ExpoNotificationAdapter();
    const onResponse = jest.fn();
    const remove = jest.fn();
    Responses.addNotificationResponseReceivedListener.mockReturnValue({
      remove,
    });
    const unsubscribe = a.subscribeToResponses(onResponse);

    unsubscribe();
    expect(
      Responses.addNotificationResponseReceivedListener,
    ).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("routes tap data and removes the native response listener", () => {
    const a = new ExpoNotificationAdapter();
    const onResponse = jest.fn();
    const remove = jest.fn();
    Responses.addNotificationResponseReceivedListener.mockImplementation(
      (handler: (response: unknown) => void) => {
        handler({
          notification: {
            request: { content: { data: { deepLink: "/success/bk-1" } } },
          },
        });
        return { remove };
      },
    );

    const unsubscribe = a.subscribeToResponses(onResponse);
    unsubscribe();

    expect(onResponse).toHaveBeenCalledWith({ deepLink: "/success/bk-1" });
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("scheduleLocal: immediate (trigger null) carries deepLink + kind in data", async () => {
    const a = new ExpoNotificationAdapter();
    await a.scheduleLocal({
      kind: "payment_success",
      title: "T",
      body: "B",
      deepLink: "/success/bk-1",
    });
    const call = Scheduler.default.mock.calls[0][0];
    expect(call.trigger).toBeNull();
    expect(call.content.data).toEqual({
      deepLink: "/success/bk-1",
      kind: "payment_success",
    });
  });

  it("scheduleLocal: a future time schedules with a date trigger", async () => {
    const a = new ExpoNotificationAdapter();
    const future = Date.now() + 60_000;
    await a.scheduleLocal({
      kind: "expiry_reminder",
      title: "T",
      body: "B",
      scheduledAtMs: future,
    });
    const call = Scheduler.default.mock.calls[0][0];
    expect(call.trigger).toBeTruthy();
    expect(call.trigger.date instanceof Date).toBe(true);
  });

  it("scheduleLocal: a PAST scheduled time fires immediately", async () => {
    const a = new ExpoNotificationAdapter();
    await a.scheduleLocal({
      kind: "admission",
      title: "T",
      body: "B",
      scheduledAtMs: Date.now() - 1000,
    });
    expect(Scheduler.default.mock.calls[0][0].trigger).toBeNull();
  });
});
