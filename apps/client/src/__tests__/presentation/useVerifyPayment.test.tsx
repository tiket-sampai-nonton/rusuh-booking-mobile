/**
 * RBT-063 — useVerifyPayment hook: authoritative verify + routing.
 * Verifies via getStatus (never the callback); routes PAID → /success,
 * FAILED/EXPIRED → /expired, pending-past-server-deadline → /expired, pending
 * with time left → null (keep polling).
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
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
import { useVerifyPayment } from "@presentation/hooks/useVerifyPayment";

class StatusRepo implements PaymentRepository {
  constructor(private readonly attempt: PaymentAttempt) {}
  async getPaymentPage(bookingId: string): Promise<PaymentPage> {
    return { bookingId, methods: ["QRIS"], amountMinor: 1, paymentExpiresAt: "", serverTime: "" };
  }
  async createAttempt(
    bookingId: string,
    _m: PaymentMethod,
    _k: string,
  ): Promise<PaymentAttempt> {
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

function wrapper(repo: PaymentRepository) {
  const base = createContainer({ useMocks: true });
  const container: Container = { ...base, paymentRepository: repo };
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <ServiceProvider container={container}>{children}</ServiceProvider>
      </QueryClientProvider>
    );
  };
}

function attempt(
  status: PaymentStatus,
  extra: Partial<PaymentAttempt> = {},
): PaymentAttempt {
  return { attemptId: "a1", bookingId: "bk-1", status, ...extra };
}

describe("useVerifyPayment (RBT-063)", () => {
  it("PAID → verdict paid, settled, route /success", async () => {
    const { result } = renderHook(() => useVerifyPayment("a1", "bk-1"), {
      wrapper: wrapper(new StatusRepo(attempt("PAID"))),
    });
    await waitFor(() => expect(result.current.verdict).toBe("paid"));
    expect(result.current.isSettled).toBe(true);
    expect(result.current.route).toBe("/success/bk-1");
  });

  it("FAILED → verdict failed, route /expired", async () => {
    const { result } = renderHook(() => useVerifyPayment("a1", "bk-1"), {
      wrapper: wrapper(new StatusRepo(attempt("FAILED"))),
    });
    await waitFor(() => expect(result.current.verdict).toBe("failed"));
    expect(result.current.route).toBe(
      "/expired/bk-1?reason=payment&bookingId=bk-1&status=FAILED",
    );
  });

  it("pending with time left → verdict pending, route null (keep polling)", async () => {
    const future = new Date(Date.now() + 300_000).toISOString();
    const { result } = renderHook(() => useVerifyPayment("a1", "bk-1"), {
      wrapper: wrapper(
        new StatusRepo(
          attempt("AWAITING_PAYMENT", {
            paymentExpiresAt: future,
            serverTime: new Date().toISOString(),
          }),
        ),
      ),
    });
    await waitFor(() => expect(result.current.attempt).toBeDefined());
    expect(result.current.verdict).toBe("pending");
    expect(result.current.isSettled).toBe(false);
    expect(result.current.route).toBeNull();
  });

  it("pending but SERVER deadline already passed → route /expired (reconciled)", async () => {
    const past = new Date(Date.now() - 10_000).toISOString();
    const { result } = renderHook(() => useVerifyPayment("a1", "bk-1"), {
      wrapper: wrapper(
        new StatusRepo(
          attempt("AWAITING_PAYMENT", {
            paymentExpiresAt: past,
            serverTime: new Date().toISOString(),
          }),
        ),
      ),
    });
    await waitFor(() => expect(result.current.attempt).toBeDefined());
    expect(result.current.verdict).toBe("pending");
    expect(result.current.route).toBe(
      "/expired/bk-1?reason=payment&bookingId=bk-1&status=AWAITING_PAYMENT",
    );
  });

  it("reconciles deadline even when serverTime is absent (no sync, uses offset 0)", async () => {
    const past = new Date(Date.now() - 5_000).toISOString();
    const { result } = renderHook(() => useVerifyPayment("a1", "bk-1"), {
      wrapper: wrapper(
        // paymentExpiresAt present, serverTime omitted → the sync branch is skipped
        new StatusRepo(attempt("AWAITING_PAYMENT", { paymentExpiresAt: past })),
      ),
    });
    await waitFor(() => expect(result.current.attempt).toBeDefined());
    expect(result.current.route).toBe(
      "/expired/bk-1?reason=payment&bookingId=bk-1&status=AWAITING_PAYMENT",
    );
  });

  it("disabled while attemptId is empty (no verify)", async () => {
    const { result } = renderHook(() => useVerifyPayment(undefined, "bk-1"), {
      wrapper: wrapper(new StatusRepo(attempt("PAID"))),
    });
    // never resolves an attempt — stays undefined
    expect(result.current.attempt).toBeUndefined();
    expect(result.current.route).toBeNull();
  });

  it("surfaces an error when getStatus throws", async () => {
    class ErrRepo extends StatusRepo {
      override async getStatus(): Promise<PaymentAttempt> {
        throw new Error("boom");
      }
    }
    const { result } = renderHook(() => useVerifyPayment("a1", "bk-1"), {
      wrapper: wrapper(new ErrRepo(attempt("PAID"))),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("boom");
  });
});
