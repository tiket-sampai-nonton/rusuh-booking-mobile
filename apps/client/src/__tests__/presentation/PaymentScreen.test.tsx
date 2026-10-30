import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import type {
  PaymentAttempt,
  PaymentRepository,
} from "@domain/repositories/payment.repository";
import { useSessionStore } from "@presentation/stores/session-store";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

const mockRouter = { push: jest.fn(), replace: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

// eslint-disable-next-line import/first
import { PaymentScreen } from "@presentation/screens/Payment/PaymentScreen";

const attempt: PaymentAttempt = {
  attemptId: "pay-1",
  bookingId: "bk-1",
  status: "AWAITING_PAYMENT",
  redirectUrl: "https://snap.mock/bk-1",
  paymentExpiresAt: new Date(Date.now() + 600_000).toISOString(),
  serverTime: new Date().toISOString(),
};

function paymentRepo(overrides: Partial<PaymentRepository> = {}): PaymentRepository {
  return {
    createAttempt: async (bookingId) => ({ ...attempt, bookingId }),
    getStatus: async () => attempt,
    ...overrides,
  };
}

describe("PaymentScreen", () => {
  beforeEach(() => {
    mockRouter.push.mockReset();
    mockRouter.replace.mockReset();
    useSessionStore.getState().reset();
    useSessionStore.getState().setBooking("bk-1", 90000000);
  });

  it("shows the order total (== amountMinor, no service fee) and methods", () => {
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo() },
    });
    expect(screen.getByTestId("payment-total").props.children).toBe("Rp 900.000");
    expect(screen.getByTestId("method-QRIS")).toBeTruthy();
    expect(screen.getByTestId("method-GOPAY")).toBeTruthy();
    // No credit-card method is offered.
    expect(screen.queryByText(/kartu kredit/i)).toBeNull();
  });

  it("enables Bayar only after a method is selected, then hands off to SNAP", async () => {
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo() },
    });
    // Press before selecting — no navigation.
    fireEvent.press(screen.getByTestId("pay-now"));
    expect(mockRouter.push).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId("method-VA_BCA"));
    fireEvent.press(screen.getByTestId("pay-now"));
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith("/snap/bk-1"),
    );
    expect(useSessionStore.getState().paymentMethod).toBe("VA_BCA");
    expect(useSessionStore.getState().attemptId).toBe("pay-1");
  });

  it("shows a timer counting down", () => {
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo() },
    });
    // Default 10-min window before an attempt exists.
    expect(screen.getByTestId("payment-timer").props.children.join("")).toMatch(
      /\d\d:\d\d/,
    );
  });

  it("surfaces a createAttempt error", async () => {
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: paymentRepo({
          createAttempt: async () => {
            throw new Error("Layanan pembayaran sedang gangguan. Coba lagi.");
          },
        }),
      },
    });
    fireEvent.press(screen.getByTestId("method-QRIS"));
    fireEvent.press(screen.getByTestId("pay-now"));
    await waitFor(() =>
      expect(
        screen.getByText("Layanan pembayaran sedang gangguan. Coba lagi."),
      ).toBeTruthy(),
    );
  });

  it("redirects to expired when the attempt's deadline is already past", async () => {
    const pastAttempt: PaymentAttempt = {
      ...attempt,
      paymentExpiresAt: new Date(Date.now() - 1000).toISOString(),
      serverTime: new Date().toISOString(),
    };
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: paymentRepo({
          createAttempt: async () => pastAttempt,
        }),
      },
    });
    // Create an attempt whose deadline is in the past → countdown fires expiry.
    fireEvent.press(screen.getByTestId("method-QRIS"));
    fireEvent.press(screen.getByTestId("pay-now"));
    await waitFor(
      () => expect(mockRouter.replace).toHaveBeenCalledWith("/expired/bk-1"),
      { timeout: 3000 },
    );
  });
});
