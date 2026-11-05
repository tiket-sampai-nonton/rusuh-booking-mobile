import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { GetPaymentPage } from "@application/payment/get-payment-page.use-case";
import type {
  PaymentAttempt,
  PaymentPage,
  PaymentRepository,
} from "@domain/repositories/payment.repository";
import { methodMeta, PAYMENT_METHODS } from "@domain/rules/payment-method";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { usePaymentPage } from "@presentation/hooks/usePaymentPage";

const PAGE: PaymentPage = {
  bookingId: "bk-1",
  methods: ["VA_BCA", "QRIS"],
  amountMinor: 45000000,
  paymentExpiresAt: "2999-01-01T00:00:00.000Z",
  serverTime: "2026-12-01T00:00:00.000Z",
};

class FakeRepo implements PaymentRepository {
  calls: string[] = [];
  async getPaymentPage(bookingId: string): Promise<PaymentPage> {
    this.calls.push(bookingId);
    return { ...PAGE, bookingId };
  }
  async createAttempt(bookingId: string): Promise<PaymentAttempt> {
    return { attemptId: "a", bookingId, status: "AWAITING_PAYMENT" };
  }
  async getStatus(): Promise<PaymentAttempt> {
    return { attemptId: "a", bookingId: "bk-1", status: "AWAITING_PAYMENT" };
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
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
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

describe("GetPaymentPage (RBT-060)", () => {
  it("delegates to the port and returns the page", async () => {
    const repo = new FakeRepo();
    const out = await new GetPaymentPage(repo).execute("bk-9");
    expect(repo.calls).toEqual(["bk-9"]);
    expect(out.amountMinor).toBe(45000000);
  });
});

describe("usePaymentPage (RBT-060)", () => {
  it("fetches the page for the booking", async () => {
    const repo = new FakeRepo();
    const { result } = renderHook(() => usePaymentPage("bk-1"), {
      wrapper: wrapper(repo),
    });
    await waitFor(() => expect(result.current.page?.bookingId).toBe("bk-1"));
    expect(result.current.page?.methods).toEqual(["VA_BCA", "QRIS"]);
  });

  it("does not fetch for an empty bookingId", () => {
    const repo = new FakeRepo();
    const { result } = renderHook(() => usePaymentPage(""), {
      wrapper: wrapper(repo),
    });
    expect(result.current.page).toBeUndefined();
    expect(repo.calls).toEqual([]);
  });
});

describe("payment-method rule (RBT-060)", () => {
  it("maps every method code to metadata with a name + icon", () => {
    for (const m of PAYMENT_METHODS) {
      expect(m.name.length).toBeGreaterThan(0);
      expect(m.icon.length).toBeGreaterThan(0);
    }
  });

  it("methodMeta looks up a known code and falls back for an unknown one", () => {
    expect(methodMeta("QRIS").name).toMatch(/QRIS/);
    // @ts-expect-error — exercising the defensive fallback for an off-contract code
    expect(methodMeta("UNKNOWN").name).toBe("UNKNOWN");
  });
});
