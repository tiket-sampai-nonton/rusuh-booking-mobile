import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";
import { setPaymentHandoff } from "@presentation/stores/payment-handoff";
import type { BookingRepository } from "@domain/repositories/booking.repository";
import type {
  PaymentAttempt,
  PaymentRepository,
} from "@domain/repositories/payment.repository";
import { createContainer } from "@providers/container";
import {
  PaymentWebViewScreen,
  isBackendPaymentReturn,
  resolveWebViewNav,
} from "@presentation/screens/PaymentWebView";

const mockRouter = { replace: jest.fn(), back: jest.fn() };

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useNavigation: () => ({ addListener: jest.fn(() => jest.fn()) }),
}));
const RN = require("react-native") as typeof import("react-native");

describe("native SNAP WebView", () => {
  const originalOS = RN.Platform.OS;
  afterEach(() => {
    Object.defineProperty(RN.Platform, "OS", {
      value: originalOS,
      configurable: true,
    });
    mockRouter.replace.mockReset();
  });

  it("opens the backend SNAP redirect directly in the WebView", () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    setPaymentHandoff(
      "booking-1",
      "https://app.sandbox.midtrans.com/snap/v4/redirection/test",
    );
    renderWithProviders(<PaymentWebViewScreen bookingId="booking-1" />);
    expect(screen.getByTestId("paywv-webview").props.accessibilityLabel).toBe(
      "https://app.sandbox.midtrans.com/snap/v4/redirection/test",
    );
  });

  it("rejects non-Midtrans and insecure payment URLs", () => {
    expect(() =>
      setPaymentHandoff("booking-1", "https://attacker.example/snap"),
    ).toThrow();
    expect(() =>
      setPaymentHandoff("booking-1", "http://app.midtrans.com/snap"),
    ).toThrow();
  });

  it("shows recovery when no matching handoff exists", () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "android",
      configurable: true,
    });
    renderWithProviders(<PaymentWebViewScreen bookingId="other-booking" />);
    expect(screen.getByTestId("paywv-error")).toBeTruthy();
  });

  it("asks the BE to cancel before leaving SNAP", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "android",
      configurable: true,
    });
    setPaymentHandoff(
      "booking-1",
      "https://app.sandbox.midtrans.com/snap/v4/redirection/test",
    );
    renderWithProviders(<PaymentWebViewScreen bookingId="booking-1" />);
    fireEvent.press(screen.getByTestId("paywv-close"));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/"));
  });

  it("returns to the payment page when the active SNAP attempt is locked", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "android",
      configurable: true,
    });
    setPaymentHandoff(
      "booking-1",
      "https://app.sandbox.midtrans.com/snap/v4/redirection/test",
    );
    const base = createContainer({ useMocks: true });
    const bookingRepository: BookingRepository = {
      ...base.bookingRepository,
      cancelBooking: async () => {
        throw new Error("BOOKING_LOCKED");
      },
    };
    const paymentRepository: PaymentRepository = {
      ...base.paymentRepository,
      getStatus: async (): Promise<PaymentAttempt> => ({
        attemptId: "1",
        bookingId: "booking-1",
        status: "AWAITING_PAYMENT",
      }),
    };
    renderWithProviders(<PaymentWebViewScreen bookingId="booking-1" />, {
      container: { bookingRepository, paymentRepository },
    });
    fireEvent.press(screen.getByTestId("paywv-close"));
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/payment/booking-1"),
    );
  });

  it("routes to success when payment wins the cancellation race", async () => {
    Object.defineProperty(RN.Platform, "OS", {
      value: "ios",
      configurable: true,
    });
    setPaymentHandoff(
      "booking-1",
      "https://app.sandbox.midtrans.com/snap/v4/redirection/test",
    );
    const base = createContainer({ useMocks: true });
    const bookingRepository: BookingRepository = {
      ...base.bookingRepository,
      cancelBooking: async () => ({
        bookingId: "booking-1",
        status: "PAID",
        amountMinor: 1000,
      }),
    };
    renderWithProviders(<PaymentWebViewScreen bookingId="booking-1" />, {
      container: { bookingRepository },
    });
    fireEvent.press(screen.getByTestId("paywv-close"));
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/success/booking-1"),
    );
  });

  it("recognizes backend-provided callback URLs without trusting query status", () => {
    const returns = {
      successReturnUrl: "https://example.com/payment/success",
      failedReturnUrl: "https://example.com/payment/failed",
    };
    expect(
      isBackendPaymentReturn(
        "https://example.com/payment/success?transaction_status=pending",
        returns,
      ),
    ).toBe(true);
    expect(
      isBackendPaymentReturn("https://example.com/payment/failed", returns),
    ).toBe(true);
    expect(
      isBackendPaymentReturn(
        "https://attacker.example/payment/success",
        returns,
      ),
    ).toBe(false);
  });
});

describe("resolveWebViewNav (RBT-062)", () => {
  it("routes a success return to the result GATE, not straight to /success (RBT-063)", () => {
    // never trust the callback — it must go through the authoritative verify.
    expect(
      resolveWebViewNav(
        "https://app/success/bk-1",
        "bk-1",
        undefined,
        "https://app",
      ),
    ).toBe("/payment-result/bk-1");
  });
  it("carries attemptId into the result gate when known", () => {
    expect(
      resolveWebViewNav(
        "https://app/success/bk-1",
        "bk-1",
        "a7",
        "https://app",
      ),
    ).toBe("/payment-result/bk-1?attemptId=a7");
  });
  it("verifies a failed or expired return", () => {
    expect(
      resolveWebViewNav(
        "https://app/failed?x=1",
        "bk-1",
        undefined,
        "https://app",
      ),
    ).toBe("/payment-result/bk-1");
    expect(
      resolveWebViewNav(
        "https://app/expired/bk-1",
        "bk-1",
        undefined,
        "https://app",
      ),
    ).toBe("/payment-result/bk-1");
  });
  it("stays (null) for an intermediate SNAP URL", () => {
    expect(
      resolveWebViewNav(
        "https://snap.mock/bk-1/step",
        "bk-1",
        undefined,
        "https://app",
      ),
    ).toBeNull();
    expect(
      resolveWebViewNav(
        "https://attacker.example/success/bk-1",
        "bk-1",
        undefined,
        "https://app",
      ),
    ).toBeNull();
  });
});
