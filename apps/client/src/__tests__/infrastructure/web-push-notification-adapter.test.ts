/**
 * RBT-073 — WebPushNotificationAdapter + webPushSupported (feature-detect/degrade).
 */
import {
  defaultWebPushEnv,
  WebPushNotificationAdapter,
  webPushSupported,
  type WebPushEnv,
} from "@infrastructure/notifications/web-push-notification.adapter";

function env(over: Partial<WebPushEnv> = {}): WebPushEnv {
  return {
    hasNotification: true,
    hasServiceWorker: true,
    hasPushManager: true,
    requestPermission: jest.fn().mockResolvedValue("granted"),
    currentPermission: jest.fn().mockReturnValue("default"),
    registerServiceWorker: jest.fn().mockResolvedValue({
      subscribe: jest.fn().mockResolvedValue("https://push/endpoint"),
    }),
    showViaRegistration: jest.fn().mockResolvedValue(true),
    ...over,
  };
}

describe("webPushSupported (RBT-073)", () => {
  it("true only when Notification + serviceWorker + PushManager all present", () => {
    expect(
      webPushSupported({
        hasNotification: true,
        hasServiceWorker: true,
        hasPushManager: true,
      }),
    ).toBe(true);
    expect(
      webPushSupported({
        hasNotification: false,
        hasServiceWorker: true,
        hasPushManager: true,
      }),
    ).toBe(false);
    expect(
      webPushSupported({
        hasNotification: true,
        hasServiceWorker: false,
        hasPushManager: true,
      }),
    ).toBe(false);
    expect(
      webPushSupported({
        hasNotification: true,
        hasServiceWorker: true,
        hasPushManager: false,
      }),
    ).toBe(false);
  });
});

describe("WebPushNotificationAdapter.requestPermission", () => {
  it("granted current permission needs no prompt", async () => {
    const e = env({ currentPermission: jest.fn().mockReturnValue("granted") });
    expect(await new WebPushNotificationAdapter(e).requestPermission()).toBe(
      true,
    );
    expect(e.requestPermission).not.toHaveBeenCalled();
  });
  it("denied current permission returns false without prompting", async () => {
    const e = env({ currentPermission: jest.fn().mockReturnValue("denied") });
    expect(await new WebPushNotificationAdapter(e).requestPermission()).toBe(
      false,
    );
    expect(e.requestPermission).not.toHaveBeenCalled();
  });
  it("default prompts and honors the result", async () => {
    const e = env({
      requestPermission: jest.fn().mockResolvedValue("granted"),
    });
    expect(await new WebPushNotificationAdapter(e).requestPermission()).toBe(
      true,
    );
  });
  it("DEGRADES: no Notification support → false", async () => {
    const e = env({ hasNotification: false });
    expect(await new WebPushNotificationAdapter(e).requestPermission()).toBe(
      false,
    );
  });
});

describe("WebPushNotificationAdapter.registerForRemotePush", () => {
  it("registers the SW + returns the push subscription endpoint", async () => {
    const e = env({ currentPermission: jest.fn().mockReturnValue("granted") });
    const token = await new WebPushNotificationAdapter(
      e,
    ).registerForRemotePush();
    expect(e.registerServiceWorker).toHaveBeenCalledWith("/sw.js");
    expect(token).toBe("https://push/endpoint");
  });
  it("DEGRADES: unsupported browser → null (no SW registration)", async () => {
    const e = env({ hasPushManager: false });
    expect(
      await new WebPushNotificationAdapter(e).registerForRemotePush(),
    ).toBeNull();
    expect(e.registerServiceWorker).not.toHaveBeenCalled();
  });
  it("permission denied → null", async () => {
    const e = env({ currentPermission: jest.fn().mockReturnValue("denied") });
    expect(
      await new WebPushNotificationAdapter(e).registerForRemotePush(),
    ).toBeNull();
  });
  it("SW registration returns null → null token", async () => {
    const e = env({
      currentPermission: jest.fn().mockReturnValue("granted"),
      registerServiceWorker: jest.fn().mockResolvedValue(null),
    });
    expect(
      await new WebPushNotificationAdapter(e).registerForRemotePush(),
    ).toBeNull();
  });
});

describe("defaultWebPushEnv (real browser surface, RBT-073)", () => {
  const g = globalThis as Record<string, unknown>;
  const saved = {
    Notification: g.Notification,
    navigator: g.navigator,
    PushManager: g.PushManager,
  };
  afterEach(() => {
    g.Notification = saved.Notification;
    g.navigator = saved.navigator;
    g.PushManager = saved.PushManager;
  });

  it("feature-detects + registers SW, subscribes, and shows via registration", async () => {
    const subscribe = jest
      .fn()
      .mockResolvedValue({ endpoint: "https://push/x" });
    const showNotification = jest.fn().mockResolvedValue(undefined);
    const register = jest
      .fn()
      .mockResolvedValue({ pushManager: { subscribe }, showNotification });
    g.Notification = {
      permission: "granted",
      requestPermission: jest.fn().mockResolvedValue("granted"),
    };
    g.navigator = { serviceWorker: { register } };
    g.PushManager = function PushManager() {};

    const e = defaultWebPushEnv();
    expect(e.hasNotification).toBe(true);
    expect(e.hasServiceWorker).toBe(true);
    expect(e.hasPushManager).toBe(true);
    expect(e.currentPermission()).toBe("granted");
    expect(await e.requestPermission()).toBe("granted");

    const reg = await e.registerServiceWorker("/sw.js");
    expect(register).toHaveBeenCalledWith("/sw.js");
    expect(await reg?.subscribe()).toBe("https://push/x");

    expect(await e.showViaRegistration("T", { body: "B", data: {} })).toBe(
      true,
    );
    expect(showNotification).toHaveBeenCalledWith("T", { body: "B", data: {} });
  });

  it("degrades when globals are absent (no throw, safe defaults)", async () => {
    delete g.Notification;
    delete g.navigator;
    delete g.PushManager;
    const e = defaultWebPushEnv();
    expect(e.hasNotification).toBe(false);
    expect(e.hasServiceWorker).toBe(false);
    expect(e.hasPushManager).toBe(false);
    expect(e.currentPermission()).toBe("denied");
    expect(await e.requestPermission()).toBe("denied");
    expect(await e.registerServiceWorker("/sw.js")).toBeNull();
    expect(await e.showViaRegistration("T", { body: "B", data: {} })).toBe(
      false,
    );
  });

  it("subscribe returns null when the push subscribe throws", async () => {
    const register = jest.fn().mockResolvedValue({
      pushManager: {
        subscribe: jest.fn().mockRejectedValue(new Error("blocked")),
      },
      showNotification: jest.fn(),
    });
    g.navigator = { serviceWorker: { register } };
    const e = defaultWebPushEnv();
    const reg = await e.registerServiceWorker("/sw.js");
    expect(await reg?.subscribe()).toBeNull();
  });
});

describe("WebPushNotificationAdapter.scheduleLocal", () => {
  it("shows the notification with deepLink + kind in data", async () => {
    const e = env({ currentPermission: jest.fn().mockReturnValue("granted") });
    await new WebPushNotificationAdapter(e).scheduleLocal({
      kind: "payment_success",
      title: "T",
      body: "B",
      deepLink: "/success/bk-1",
    });
    expect(e.showViaRegistration).toHaveBeenCalledWith("T", {
      body: "B",
      data: { deepLink: "/success/bk-1", kind: "payment_success" },
      tag: "payment_success",
    });
  });
  it("DEGRADES: no Notification support → shows nothing, no throw", async () => {
    const e = env({ hasNotification: false });
    await new WebPushNotificationAdapter(e).scheduleLocal({
      kind: "admission",
      title: "T",
      body: "B",
    });
    expect(e.showViaRegistration).not.toHaveBeenCalled();
  });
  it("permission denied → shows nothing", async () => {
    const e = env({ currentPermission: jest.fn().mockReturnValue("denied") });
    await new WebPushNotificationAdapter(e).scheduleLocal({
      kind: "admission",
      title: "T",
      body: "B",
    });
    expect(e.showViaRegistration).not.toHaveBeenCalled();
  });
});
