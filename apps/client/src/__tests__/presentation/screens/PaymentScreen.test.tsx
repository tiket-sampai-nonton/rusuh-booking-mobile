import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import type {
  PaymentAttempt,
  PaymentMethod,
  PaymentPage,
  PaymentRepository,
} from "@domain/repositories/payment.repository";
import { MockNotificationAdapter } from "@infrastructure/__fixtures__/mock-notification.adapter";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";
import { useSessionStore } from "@presentation/stores/session-store";

const mockRouter = { push: jest.fn(), replace: jest.fn() };
const mockNavigation = { addListener: jest.fn(() => jest.fn()) };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useNavigation: () => mockNavigation,
}));

// eslint-disable-next-line import/first
import { PaymentScreen } from "@presentation/screens/Payment";

function page(over: Partial<PaymentPage> = {}): PaymentPage {
  return {
    bookingId: "bk-1",
    methods: ["VA_BCA", "QRIS", "GOPAY"],
    amountMinor: 450000,
    paymentExpiresAt: "2999-01-01T00:00:00.000Z",
    serverTime: "2026-12-01T00:00:00.000Z",
    ...over,
  };
}

function paymentRepo(p: PaymentPage): PaymentRepository {
  return {
    getPaymentPage: async () => p,
    createAttempt: async (
      bookingId: string,
      _m: PaymentMethod,
      _k: string,
    ): Promise<PaymentAttempt> => ({
      attemptId: "a1",
      bookingId,
      status: "AWAITING_PAYMENT",
    }),
    getStatus: async (): Promise<PaymentAttempt> => ({
      attemptId: "a1",
      bookingId: "bk-1",
      status: "AWAITING_PAYMENT",
    }),
    createPageToken: async (bookingId: string) => ({
      pageToken: "t",
      pageUrl: `/payment/${bookingId}`,
    }),
    exchangePageToken: async (): Promise<void> => {},
    snapCallback: async (attemptId: string): Promise<PaymentAttempt> => ({
      attemptId,
      bookingId: "bk-1",
      status: "PAID",
    }),
  };
}

describe("PaymentScreen — summary + method + timer (RBT-060)", () => {
  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
    mockRouter.replace.mockReset();
    useSessionStore.getState().reset();
  });
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("shows a loading state until the page arrives", async () => {
    let release!: (p: PaymentPage) => void;
    const gate = new Promise<PaymentPage>((r) => (release = r));
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: {
          ...paymentRepo(page()),
          getPaymentPage: () => gate,
        },
      },
    });
    expect(screen.getByTestId("payment-loading")).toBeTruthy();
    release(page());
    await waitFor(() =>
      expect(screen.queryByTestId("payment-loading")).toBeNull(),
    );
  });

  it("blocks payment actions and offers recovery when a direct route is rejected", async () => {
    renderWithProviders(<PaymentScreen bookingId="unknown" />, {
      container: {
        paymentRepository: {
          ...paymentRepo(page()),
          getPaymentPage: async () => {
            throw new Error("PAYMENT_NOT_FOUND: missing booking");
          },
        },
      },
    });
    await waitFor(() =>
      expect(screen.getByTestId("payment-unavailable")).toBeTruthy(),
    );
    expect(screen.queryByTestId("pay-now")).toBeNull();
    fireEvent.press(screen.getByTestId("payment-unavailable-browse"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/browse");
  });

  it("renders the total == amountMinor with NO service-fee line (D10.1)", async () => {
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo(page()) },
    });
    await waitFor(() =>
      expect(screen.getByTestId("payment-total").props.children).toBe(
        "Rp 450.000",
      ),
    );
    expect(useSessionStore.getState().amountMinor).toBe(450000);
    expect(screen.queryByText(/biaya layanan/i)).toBeNull();
  });

  it("renders ONLY the server-provided methods (AC2)", async () => {
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: paymentRepo(
          page({ methods: ["VA_BCA", "QRIS", "GOPAY"] }),
        ),
      },
    });
    await waitFor(() =>
      expect(screen.getByTestId("method-VA_BCA")).toBeTruthy(),
    );
    expect(screen.getByTestId("method-QRIS")).toBeTruthy();
    expect(screen.getByTestId("method-GOPAY")).toBeTruthy();
    // A method the server did NOT offer is absent.
    expect(screen.queryByTestId("method-VA_BNI")).toBeNull();
  });

  it("defaults to the first method and enables Bayar on selection", async () => {
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo(page()) },
    });
    await waitFor(() =>
      expect(screen.getByTestId("method-VA_BCA")).toBeTruthy(),
    );
    // First method default-selected → Bayar already enabled.
    await waitFor(() =>
      expect(
        screen.getByTestId("pay-now").props.accessibilityState.disabled,
      ).toBe(false),
    );
    // Selecting another method keeps it enabled.
    fireEvent.press(screen.getByTestId("method-GOPAY"));
    expect(
      screen.getByTestId("pay-now").props.accessibilityState.disabled,
    ).toBe(false);
  });

  it("pressing Bayar creates an attempt (RBT-061)", async () => {
    const attempts: PaymentMethod[] = [];
    const repo: PaymentRepository = {
      ...paymentRepo(page()),
      createAttempt: async (bookingId, method): Promise<PaymentAttempt> => {
        attempts.push(method);
        return {
          attemptId: "a1",
          bookingId,
          status: "AWAITING_PAYMENT",
          // no redirectUrl → onSuccess records method, skips the real handoff
        };
      },
    };
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: { paymentRepository: repo },
    });
    await waitFor(() =>
      expect(
        screen.getByTestId("pay-now").props.accessibilityState.disabled,
      ).toBe(false),
    );
    fireEvent.press(screen.getByTestId("pay-now"));
    await waitFor(() => expect(attempts).toEqual(["VA_BCA"])); // default method
  });

  it("refresh-safe: an AWAITING attempt shows 'Kembali ke SNAP' (AC2)", async () => {
    const withAttempt = page({
      currentAttempt: {
        attemptId: "a-existing",
        bookingId: "bk-1",
        status: "AWAITING_PAYMENT",
        // no redirectUrl → resume is a safe no-op in the test
      },
    });
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo(withAttempt) },
    });
    await waitFor(() =>
      expect(screen.getByText("Kembali ke SNAP")).toBeTruthy(),
    );
    // The resume CTA is pressable (does not throw without a redirectUrl).
    fireEvent.press(screen.getByTestId("pay-now"));
  });

  it("shows an error message when creating the attempt fails (RBT-061)", async () => {
    const repo: PaymentRepository = {
      ...paymentRepo(page()),
      createAttempt: async (): Promise<PaymentAttempt> => {
        throw new Error("Gagal memproses pembayaran. Coba lagi.");
      },
    };
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: { paymentRepository: repo },
    });
    await waitFor(() =>
      expect(
        screen.getByTestId("pay-now").props.accessibilityState.disabled,
      ).toBe(false),
    );
    fireEvent.press(screen.getByTestId("pay-now"));
    await waitFor(() =>
      expect(screen.getByText(/Gagal memproses pembayaran/i)).toBeTruthy(),
    );
  });

  it("asks before leaving when the payment back button is pressed", async () => {
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo(page()) },
    });
    await waitFor(() =>
      expect(screen.getByTestId("payment-back")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("payment-back"));
    expect(screen.getByTestId("checkout-leave-modal")).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId("checkout-leave-confirm"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });

  it("sends a local notification after confirming payment-flow exit", async () => {
    const notification = new MockNotificationAdapter();
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: paymentRepo(page()),
        notification,
      },
    });
    await waitFor(() =>
      expect(screen.getByTestId("payment-back")).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId("payment-back"));
    fireEvent.press(screen.getByTestId("checkout-leave-confirm"));

    await waitFor(() =>
      expect(notification.scheduled).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "payment_timeout",
            notificationId: "payment-timeout-bk-1",
            deepLink: "/payment/bk-1",
          }),
          expect.objectContaining({
            kind: "payment_cancelled",
            deepLink: "/payment/bk-1",
          }),
        ]),
      ),
    );
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });

  it("pressing Bayar is a no-op stub until RBT-061 (does not navigate yet)", async () => {
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: { paymentRepository: paymentRepo(page()) },
    });
    await waitFor(() =>
      expect(
        screen.getByTestId("pay-now").props.accessibilityState.disabled,
      ).toBe(false),
    );
    fireEvent.press(screen.getByTestId("pay-now")); // onPay stub (RBT-060)
    // RBT-061 wires the SNAP handoff; for now no payment navigation occurs.
    expect(mockRouter.replace).not.toHaveBeenCalledWith(
      expect.stringContaining("/payment/"),
    );
  });

  it("redirects to /failed when the payment countdown elapses", async () => {
    renderWithProviders(<PaymentScreen bookingId="bk-1" />, {
      container: {
        paymentRepository: paymentRepo(
          page({
            paymentExpiresAt: "2026-12-01T00:00:00.000Z",
            serverTime: "2026-12-01T00:10:00.000Z", // already past
          }),
        ),
      },
    });
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/failed/bk-1"),
    );
  });
});
