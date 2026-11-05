/**
 * RBT-072 — useNotifications: registers on mount + routes a notification tap to
 * its deep link. routeForTap is the pure tap→route resolver.
 */
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { routeForTap, useNotifications } from "@presentation/hooks/useNotifications";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Notifications = require("expo-notifications") as {
  addNotificationResponseReceivedListener: jest.Mock;
  getPermissionsAsync: jest.Mock;
  requestPermissionsAsync: jest.Mock;
  getExpoPushTokenAsync: jest.Mock;
};

describe("routeForTap (RBT-072, pure)", () => {
  it("routes to the deep link, else null", () => {
    expect(routeForTap({ deepLink: "/checkout/s-1" })).toBe("/checkout/s-1");
    expect(routeForTap({ deepLink: "https://x" })).toBeNull();
    expect(routeForTap(undefined)).toBeNull();
  });
});

describe("useNotifications (RBT-072)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: true });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: "ExpoPushToken[xyz]" });
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ServiceProvider container={createContainer({ useMocks: true })}>
        {children}
      </ServiceProvider>
    );
  }

  it("registers a tap listener on mount and routes the tap's deep link", async () => {
    let handler: ((r: unknown) => void) | undefined;
    Notifications.addNotificationResponseReceivedListener.mockImplementation(
      (h: (r: unknown) => void) => {
        handler = h;
        return { remove: jest.fn() };
      },
    );
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() =>
      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled(),
    );
    // simulate a tap on a payment-success notification
    handler?.({
      notification: {
        request: { content: { data: { deepLink: "/success/bk-1", kind: "payment_success" } } },
      },
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/success/bk-1");
  });

  it("is a no-op on web (web push is RBT-073)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RN = require("react-native") as typeof import("react-native");
    const orig = RN.Platform.OS;
    Object.defineProperty(RN.Platform, "OS", { value: "web", configurable: true });
    const container = createContainer({ useMocks: true });
    const register = jest.spyOn(container.notification, "registerForRemotePush");
    const webWrapper = ({ children }: { children: React.ReactNode }) => (
      <ServiceProvider container={container}>{children}</ServiceProvider>
    );
    renderHook(() => useNotifications(), { wrapper: webWrapper });
    await waitFor(() => expect(register).toHaveBeenCalled());
    expect(Notifications.addNotificationResponseReceivedListener).not.toHaveBeenCalled();
    Object.defineProperty(RN.Platform, "OS", { value: orig, configurable: true });
  });

  it("a tap with no deep link does not navigate", async () => {
    let handler: ((r: unknown) => void) | undefined;
    Notifications.addNotificationResponseReceivedListener.mockImplementation(
      (h: (r: unknown) => void) => {
        handler = h;
        return { remove: jest.fn() };
      },
    );
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() =>
      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled(),
    );
    handler?.({ notification: { request: { content: { data: {} } } } });
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
