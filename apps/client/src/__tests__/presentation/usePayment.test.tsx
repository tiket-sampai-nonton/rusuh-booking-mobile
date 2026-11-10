import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import type {
  PaymentAttempt,
  PaymentMethod,
  PaymentPage,
  PaymentRepository,
} from "@domain/repositories/payment.repository";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { openSnapHandoff, usePayment } from "@presentation/hooks/usePayment";
import { useSessionStore } from "@presentation/stores/session-store";

class FakeRepo implements PaymentRepository {
  async getPaymentPage(bookingId: string): Promise<PaymentPage> {
    return {
      bookingId,
      methods: ["QRIS"],
      amountMinor: 1,
      paymentExpiresAt: "",
      serverTime: "",
    };
  }
  async createAttempt(
    bookingId: string,
    _m: PaymentMethod,
    _k: string,
  ): Promise<PaymentAttempt> {
    return {
      attemptId: "a1",
      bookingId,
      status: "AWAITING_PAYMENT",
      redirectUrl: `https://snap.mock/${bookingId}`,
    };
  }
  async getStatus(attemptId: string): Promise<PaymentAttempt> {
    return { attemptId, bookingId: "b", status: "PAID" };
  }
  async createPageToken(bookingId: string) {
    return { pageToken: "t", pageUrl: `/payment/${bookingId}` };
  }
  async exchangePageToken(): Promise<void> {}
  async snapCallback(attemptId: string): Promise<PaymentAttempt> {
    return { attemptId, bookingId: "b", status: "PAID" };
  }
}

function wrapper(repo: PaymentRepository) {
  const base = createContainer({ useMocks: true });
  const container: Container = { ...base, paymentRepository: repo };
  const qc = new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  return function Wrapper({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement {
    return (
      <QueryClientProvider client={qc}>
        <ServiceProvider container={container}>{children}</ServiceProvider>
      </QueryClientProvider>
    );
  };
}

describe("usePayment (RBT-061)", () => {
  beforeEach(() => useSessionStore.getState().reset());

  it("createAttempt records the method + hands off with the redirectUrl", async () => {
    const opened: string[] = [];
    const handoff = async (u: string): Promise<void> => {
      opened.push(u);
    };
    const { result } = renderHook(() => usePayment(handoff), {
      wrapper: wrapper(new FakeRepo()),
    });
    await result.current.createAttempt.mutateAsync({
      bookingId: "bk-1",
      method: "QRIS",
    });
    await waitFor(() => expect(opened).toEqual(["https://snap.mock/bk-1"]));
    expect(useSessionStore.getState().paymentMethod).toBe("QRIS");
    expect(useSessionStore.getState().attemptId).toBe("a1");
  });

  it("resumeHandoff re-opens the redirectUrl for an in-flight attempt (AC2)", async () => {
    const opened: string[] = [];
    const { result } = renderHook(
      () => usePayment(async (u) => void opened.push(u)),
      { wrapper: wrapper(new FakeRepo()) },
    );
    await result.current.resumeHandoff({
      attemptId: "a9",
      bookingId: "bk-1",
      status: "AWAITING_PAYMENT",
      redirectUrl: "https://snap.mock/resume",
    });
    expect(opened).toEqual(["https://snap.mock/resume"]);
  });

  it("resumeHandoff is a no-op when the attempt has no redirectUrl", async () => {
    const opened: string[] = [];
    const { result } = renderHook(
      () => usePayment(async (u) => void opened.push(u)),
      { wrapper: wrapper(new FakeRepo()) },
    );
    await result.current.resumeHandoff({
      attemptId: "a9",
      bookingId: "bk-1",
      status: "AWAITING_PAYMENT",
    });
    expect(opened).toEqual([]);
  });
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const RN = require("react-native") as typeof import("react-native");

describe("openSnapHandoff (platform branches)", () => {
  const origOS = RN.Platform.OS;
  afterEach(() => {
    Object.defineProperty(RN.Platform, "OS", {
      value: origOS,
      configurable: true,
    });
  });

  it("assigns window.location on web", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "web",
      configurable: true,
    });
    const assign = jest.fn();
    Object.defineProperty(globalThis, "location", {
      value: { assign },
      configurable: true,
      writable: true,
    });
    await openSnapHandoff("https://snap.mock/x");
    expect(assign).toHaveBeenCalledWith("https://snap.mock/x");
    delete (globalThis as { location?: unknown }).location;
  });

  it("does not open a caller-provided URL on native without a booking ID", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    await openSnapHandoff("https://snap.mock/native");
  });

  it("routes a native booking handoff by ID without a caller URL", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "android",
      configurable: true,
    });
    jest.resetModules();
    const push = jest.fn();
    jest.doMock("expo-router", () => ({ router: { push } }));

    await openSnapHandoff("https://snap.mock/native", "bk / 123");

    expect(push).toHaveBeenCalledWith("/payment-webview/bk%20%2F%20123");
    jest.dontMock("expo-router");
  });

  it("routes an in-app relative path via the router (RBT-065 /snap)", async () => {
    // lazily require()'d inside openSnapHandoff; mock the module's router.push
    jest.resetModules();
    const push = jest.fn();
    jest.doMock("expo-router", () => ({ router: { push } }));
    await openSnapHandoff("/snap/bk-1");
    expect(push).toHaveBeenCalledWith("/snap/bk-1");
    jest.dontMock("expo-router");
  });
});
