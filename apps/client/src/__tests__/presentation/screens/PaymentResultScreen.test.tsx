/**
 * RBT-063 — PaymentResultScreen: the authoritative result gate.
 * Shows a processing state while verifying, navigates ONLY on the server-
 * confirmed route (PAID → /success), and surfaces a verify error.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import type {
  PaymentAttempt,
  PaymentMethod,
  PaymentPage,
  PaymentRepository,
  PaymentStatus,
} from "@domain/repositories/payment.repository";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { PaymentResultScreen } from "@presentation/screens/PaymentResult";
import { useSessionStore } from "@presentation/stores/session-store";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

class StatusRepo implements PaymentRepository {
  constructor(private readonly attempt: PaymentAttempt) {}
  async getPaymentPage(bookingId: string): Promise<PaymentPage> {
    return { bookingId, methods: ["QRIS"], amountMinor: 1, paymentExpiresAt: "", serverTime: "" };
  }
  async createAttempt(bookingId: string, _m: PaymentMethod, _k: string): Promise<PaymentAttempt> {
    return { attemptId: "a1", bookingId, status: "AWAITING_PAYMENT" };
  }
  async getStatus(): Promise<PaymentAttempt> {
    return this.attempt;
  }
  async createPageToken(bookingId: string) {
    return { pageToken: "t", pageUrl: `/payment/${bookingId}` };
  }
  async exchangePageToken(): Promise<void> {}
  async snapCallback(attemptId: string): Promise<PaymentAttempt> {
    return { attemptId, bookingId: "bk-1", status: "PAID" };
  }
}

function renderScreen(
  repo: PaymentRepository,
  props: { bookingId: string; attemptId?: string },
) {
  const base = createContainer({ useMocks: true });
  const container: Container = { ...base, paymentRepository: repo };
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ServiceProvider container={container}>
        <PaymentResultScreen {...props} />
      </ServiceProvider>
    </QueryClientProvider>,
  );
}

function attempt(status: PaymentStatus, extra: Partial<PaymentAttempt> = {}): PaymentAttempt {
  return { attemptId: "a1", bookingId: "bk-1", status, ...extra };
}

describe("PaymentResultScreen (RBT-063)", () => {
  beforeEach(() => {
    mockRouter.replace.mockReset();
    useSessionStore.getState().reset();
  });

  it("renders the processing gate (spinner) and never trusts the callback", () => {
    const future = new Date(Date.now() + 300_000).toISOString();
    const screen = renderScreen(
      new StatusRepo(
        attempt("AWAITING_PAYMENT", { paymentExpiresAt: future, serverTime: new Date().toISOString() }),
      ),
      { bookingId: "bk-1", attemptId: "a1" },
    );
    expect(screen.getByTestId("payment-result-spinner")).toBeTruthy();
  });

  it("navigates to /success ONLY after the authoritative status is PAID", async () => {
    renderScreen(new StatusRepo(attempt("PAID")), {
      bookingId: "bk-1",
      attemptId: "a1",
    });
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/success/bk-1"),
    );
  });

  it("navigates to /expired on FAILED", async () => {
    renderScreen(new StatusRepo(attempt("FAILED")), {
      bookingId: "bk-1",
      attemptId: "a1",
    });
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith(
        "/expired/bk-1?reason=payment&bookingId=bk-1&status=FAILED",
      ),
    );
  });

  it("falls back to the session-store attemptId when the return URL omits it", async () => {
    useSessionStore.getState().setPaymentMethod("QRIS", "a1");
    renderScreen(new StatusRepo(attempt("PAID")), { bookingId: "bk-1" });
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/success/bk-1"),
    );
  });

  it("shows a retry message when verify errors (no navigation)", async () => {
    class ErrRepo extends StatusRepo {
      override async getStatus(): Promise<PaymentAttempt> {
        throw new Error("boom");
      }
    }
    const screen = renderScreen(new ErrRepo(attempt("PAID")), {
      bookingId: "bk-1",
      attemptId: "a1",
    });
    await waitFor(() =>
      expect(screen.getByTestId("payment-result-error")).toBeTruthy(),
    );
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("offers a payment recovery route when a cold deep link has no attempt id", () => {
    const screen = renderScreen(new StatusRepo(attempt("AWAITING_PAYMENT")), {
      bookingId: "bk-1",
    });

    expect(screen.getByTestId("payment-result-error")).toBeTruthy();
    expect(screen.queryByTestId("payment-result-spinner")).toBeNull();
    fireEvent.press(screen.getByTestId("payment-result-return"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/payment/bk-1");
  });
});
