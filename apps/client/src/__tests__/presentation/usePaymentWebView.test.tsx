import { renderHook } from "@testing-library/react-native";
import React from "react";

import type {
  PageToken,
  PaymentAttempt,
  PaymentPage,
  PaymentRepository,
} from "@domain/repositories/payment.repository";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { usePaymentWebView } from "@presentation/hooks/usePaymentWebView";

class FakeRepo implements PaymentRepository {
  exchanged: string[] = [];
  async getPaymentPage(bookingId: string): Promise<PaymentPage> {
    return { bookingId, methods: ["QRIS"], amountMinor: 1, paymentExpiresAt: "", serverTime: "" };
  }
  async createAttempt(bookingId: string): Promise<PaymentAttempt> {
    return { attemptId: "a", bookingId, status: "AWAITING_PAYMENT" };
  }
  async getStatus(): Promise<PaymentAttempt> {
    return { attemptId: "a", bookingId: "b", status: "PAID" };
  }
  async createPageToken(bookingId: string): Promise<PageToken> {
    return { pageToken: "pgt_9", pageUrl: `/payment/${bookingId}?rb_pay_token=pgt_9` };
  }
  async exchangePageToken(pageToken: string): Promise<void> {
    this.exchanged.push(pageToken);
  }
  async snapCallback(attemptId: string): Promise<PaymentAttempt> {
    return { attemptId, bookingId: "b", status: "PAID" };
  }
}

function wrapper(repo: PaymentRepository) {
  const base = createContainer({ useMocks: true });
  const container: Container = { ...base, paymentRepository: repo };
  return function Wrapper({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement {
    return <ServiceProvider container={container}>{children}</ServiceProvider>;
  };
}

describe("usePaymentWebView (RBT-062)", () => {
  it("createToken mints the page token + URL", async () => {
    const repo = new FakeRepo();
    const { result } = renderHook(() => usePaymentWebView(), {
      wrapper: wrapper(repo),
    });
    const token = await result.current.createToken("bk-1");
    expect(token.pageToken).toBe("pgt_9");
    expect(token.pageUrl).toContain("/payment/bk-1");
  });

  it("exchange forwards the token to the port", async () => {
    const repo = new FakeRepo();
    const { result } = renderHook(() => usePaymentWebView(), {
      wrapper: wrapper(repo),
    });
    await result.current.exchange("pgt_9");
    expect(repo.exchanged).toEqual(["pgt_9"]);
  });
});
