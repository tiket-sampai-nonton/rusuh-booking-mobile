/**
 * RBT-065 — SnapSimulatorScreen: local SNAP simulator.
 * Renders the summary; success/unknown → the verify gate /payment-result,
 * fail → /expired?reason=payment. Drives the mock snapCallback.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import { MockPaymentRepository } from "@infrastructure/__fixtures__/mock-payment.repository";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { SnapSimulatorScreen } from "@presentation/screens/Snap";
import { useSessionStore } from "@presentation/stores/session-store";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

function renderScreen(bookingId: string) {
  const base = createContainer({ useMocks: true });
  const payment = base.paymentRepository as MockPaymentRepository;
  const container: Container = { ...base, paymentRepository: payment };
  const qc = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const utils = render(
    <QueryClientProvider client={qc}>
      <ServiceProvider container={container}>
        <SnapSimulatorScreen bookingId={bookingId} />
      </ServiceProvider>
    </QueryClientProvider>,
  );
  return { ...utils, payment };
}

describe("SnapSimulatorScreen (RBT-065)", () => {
  beforeEach(() => {
    mockRouter.replace.mockReset();
    useSessionStore.getState().reset();
  });

  it("renders the simulator shell + summary", () => {
    const screen = renderScreen("bk-1");
    expect(screen.getByTestId("snap-screen")).toBeTruthy();
    expect(screen.getByTestId("snap-success")).toBeTruthy();
    expect(screen.getByTestId("snap-fail")).toBeTruthy();
    expect(screen.getByTestId("snap-unknown")).toBeTruthy();
    // Order ID row shows the booking
    expect(screen.getByText("bk-1")).toBeTruthy();
  });

  it("selects a wallet option and exposes the selected state", () => {
    const screen = renderScreen("bk-1");
    fireEvent.press(screen.getByTestId("snap-channel-wallet"));
    fireEvent.press(screen.getByTestId("snap-wallet-qris"));
    expect(screen.getByTestId("snap-wallet-qris").props.accessibilityState.selected).toBe(true);
  });

  it("success drives snapCallback(PAID) then routes to the verify gate", async () => {
    // seed an attempt in the store + repo
    const base = createContainer({ useMocks: true });
    const payment = base.paymentRepository as MockPaymentRepository;
    const attempt = await payment.createAttempt("bk-1", "QRIS", "k1");
    useSessionStore.getState().setPaymentMethod("QRIS", attempt.attemptId);

    const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const screen = render(
      <QueryClientProvider client={qc}>
        <ServiceProvider container={{ ...base, paymentRepository: payment }}>
          <SnapSimulatorScreen bookingId="bk-1" />
        </ServiceProvider>
      </QueryClientProvider>,
    );
    fireEvent.press(screen.getByTestId("snap-success"));
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith(
        `/payment-result/bk-1?attemptId=${attempt.attemptId}`,
      ),
    );
    // mock flipped to PAID
    expect((await payment.getStatus(attempt.attemptId)).status).toBe("PAID");
  });

  it("fail routes to /expired?reason=payment", async () => {
    const base = createContainer({ useMocks: true });
    const payment = base.paymentRepository as MockPaymentRepository;
    const attempt = await payment.createAttempt("bk-1", "QRIS", "k2");
    useSessionStore.getState().setPaymentMethod("QRIS", attempt.attemptId);

    const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const screen = render(
      <QueryClientProvider client={qc}>
        <ServiceProvider container={{ ...base, paymentRepository: payment }}>
          <SnapSimulatorScreen bookingId="bk-1" />
        </ServiceProvider>
      </QueryClientProvider>,
    );
    fireEvent.press(screen.getByTestId("snap-fail"));
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith(
        "/expired/bk-1?reason=payment&bookingId=bk-1",
      ),
    );
    expect((await payment.getStatus(attempt.attemptId)).status).toBe("FAILED");
  });

  it("unknown routes to the verify gate and leaves the attempt pending", async () => {
    const base = createContainer({ useMocks: true });
    const payment = base.paymentRepository as MockPaymentRepository;
    const attempt = await payment.createAttempt("bk-1", "QRIS", "k3");
    useSessionStore.getState().setPaymentMethod("QRIS", attempt.attemptId);

    const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const screen = render(
      <QueryClientProvider client={qc}>
        <ServiceProvider container={{ ...base, paymentRepository: payment }}>
          <SnapSimulatorScreen bookingId="bk-1" />
        </ServiceProvider>
      </QueryClientProvider>,
    );
    fireEvent.press(screen.getByTestId("snap-unknown"));
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith(
        `/payment-result/bk-1?attemptId=${attempt.attemptId}`,
      ),
    );
  });

  it("with no attempt in the store, still routes to the verify gate (edge)", async () => {
    const screen = renderScreen("bk-9");
    fireEvent.press(screen.getByTestId("snap-success"));
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/payment-result/bk-9"),
    );
  });
});
