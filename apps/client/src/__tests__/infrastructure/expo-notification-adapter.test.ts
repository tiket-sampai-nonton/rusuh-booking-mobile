/**
 * RBT-072 — ExpoNotificationAdapter over the (mocked) expo-notifications SDK.
 */
import { ExpoNotificationAdapter } from "@infrastructure/notifications/expo-notification.adapter";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Notifications = require("expo-notifications") as {
  getPermissionsAsync: jest.Mock;
  requestPermissionsAsync: jest.Mock;
  getExpoPushTokenAsync: jest.Mock;
  scheduleNotificationAsync: jest.Mock;
};

describe("ExpoNotificationAdapter (RBT-072)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: true });
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: true });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: "ExpoPushToken[xyz]",
    });
    Notifications.scheduleNotificationAsync.mockResolvedValue("id");
  });

  it("requestPermission: granted current permission needs no prompt", async () => {
    const a = new ExpoNotificationAdapter();
    expect(await a.requestPermission()).toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it("requestPermission: prompts when not already granted", async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: false });
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: true });
    const a = new ExpoNotificationAdapter();
    expect(await a.requestPermission()).toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  it("registerForRemotePush: returns the Expo token when permitted", async () => {
    const a = new ExpoNotificationAdapter();
    expect(await a.registerForRemotePush()).toBe("ExpoPushToken[xyz]");
  });

  it("registerForRemotePush: null when permission denied", async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: false });
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: false });
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

  it("scheduleLocal: immediate (trigger null) carries deepLink + kind in data", async () => {
    const a = new ExpoNotificationAdapter();
    await a.scheduleLocal({
      kind: "payment_success",
      title: "T",
      body: "B",
      deepLink: "/success/bk-1",
    });
    const call = Notifications.scheduleNotificationAsync.mock.calls[0][0];
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
    const call = Notifications.scheduleNotificationAsync.mock.calls[0][0];
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
    expect(
      Notifications.scheduleNotificationAsync.mock.calls[0][0].trigger,
    ).toBeNull();
  });
});
