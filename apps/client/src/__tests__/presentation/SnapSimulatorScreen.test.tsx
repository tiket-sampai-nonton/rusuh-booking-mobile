import { fireEvent, screen } from "@testing-library/react-native";

import { MockPaymentRepository } from "@infrastructure/__fixtures__/mock-payment.repository";
import { useSessionStore } from "@presentation/stores/session-store";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const mockRouter = { replace: jest.fn(), push: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

// eslint-disable-next-line import/first
import { SnapSimulatorScreen } from "@presentation/screens/Snap";

describe("SnapSimulatorScreen", () => {
  beforeEach(() => {
    mockRouter.replace.mockReset();
    useSessionStore.getState().reset();
  });

  it("renders the simulator with success/fail controls", () => {
    renderWithProviders(<SnapSimulatorScreen bookingId="bk-1" />);
    expect(screen.getByTestId("snap-screen")).toBeTruthy();
    expect(screen.getByTestId("snap-success")).toBeTruthy();
    expect(screen.getByTestId("snap-fail")).toBeTruthy();
  });

  it("on success: flips the attempt to PAID and routes to the success page", async () => {
    // Seed a real attempt in the mock payment repo + store its id.
    const payment = new MockPaymentRepository();
    const attempt = await payment.createAttempt("bk-1", "QRIS", "k1");
    useSessionStore.getState().setPaymentMethod("QRIS", attempt.attemptId);

    renderWithProviders(<SnapSimulatorScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: payment,
        paymentSimulator: payment,
      },
    });
    fireEvent.press(screen.getByTestId("snap-success"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/success/bk-1");
    // The mock attempt is now PAID (verifiable via getStatus).
    const after = await payment.getStatus(attempt.attemptId);
    expect(after.status).toBe("PAID");
  });

  it("on failure: flips the attempt to FAILED and routes to expired", async () => {
    const payment = new MockPaymentRepository();
    const attempt = await payment.createAttempt("bk-1", "QRIS", "k2");
    useSessionStore.getState().setPaymentMethod("QRIS", attempt.attemptId);

    renderWithProviders(<SnapSimulatorScreen bookingId="bk-1" />, {
      container: { paymentRepository: payment, paymentSimulator: payment },
    });
    fireEvent.press(screen.getByTestId("snap-fail"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/expired/bk-1");
    const after = await payment.getStatus(attempt.attemptId);
    expect(after.status).toBe("FAILED");
  });

  it("navigates even when no attempt id / simulator is available (defensive)", () => {
    // No attemptId in the store, no simulator → still routes (guards skip).
    renderWithProviders(<SnapSimulatorScreen bookingId="bk-1" />, {
      container: { paymentSimulator: undefined },
    });
    fireEvent.press(screen.getByTestId("snap-success"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/success/bk-1");
  });
});
