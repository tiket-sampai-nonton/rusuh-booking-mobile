/** RBT-072 — notification taps route through the framework-free port. */
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import {
  routeForTap,
  useNotifications,
} from "@presentation/hooks/useNotifications";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

describe("routeForTap (RBT-072, pure)", () => {
  it("routes only supported in-app deep links", () => {
    expect(routeForTap({ deepLink: "/checkout/s-1" })).toBe("/checkout/s-1");
    expect(routeForTap({ deepLink: "https://x" })).toBeNull();
    expect(routeForTap(undefined)).toBeNull();
  });
});

describe("useNotifications (RBT-072)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("registers on mount and routes a response through NotificationPort", async () => {
    const container = createContainer({ useMocks: true });
    let handler:
      | ((data: Readonly<Record<string, unknown>> | undefined) => void)
      | undefined;
    const subscribe = jest
      .spyOn(container.notification, "subscribeToResponses")
      .mockImplementation((onResponse) => {
        handler = onResponse;
        return jest.fn();
      });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ServiceProvider container={container}>{children}</ServiceProvider>
    );

    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(subscribe).toHaveBeenCalledTimes(1));
    handler?.({ deepLink: "/success/bk-1", kind: "payment_success" });
    expect(mockRouter.push).toHaveBeenCalledWith("/success/bk-1");
  });

  it("does not subscribe when optional push registration fails", async () => {
    const container = createContainer({ useMocks: true });
    const register = jest
      .spyOn(container.notification, "registerForRemotePush")
      .mockRejectedValue(new Error("Remote notifications unavailable"));
    const subscribe = jest.spyOn(
      container.notification,
      "subscribeToResponses",
    );
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ServiceProvider container={container}>{children}</ServiceProvider>
    );

    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(register).toHaveBeenCalled());
    expect(subscribe).not.toHaveBeenCalled();
  });

  it("ignores taps without a valid deep link", async () => {
    const container = createContainer({ useMocks: true });
    let handler:
      | ((data: Readonly<Record<string, unknown>> | undefined) => void)
      | undefined;
    jest
      .spyOn(container.notification, "subscribeToResponses")
      .mockImplementation((onResponse) => {
        handler = onResponse;
        return jest.fn();
      });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ServiceProvider container={container}>{children}</ServiceProvider>
    );

    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(handler).toBeDefined());
    handler?.({});
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
