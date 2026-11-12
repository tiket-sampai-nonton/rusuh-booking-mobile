/**
 * usePaymentWebView — mobile page-token WebView seam (RBT-062).
 *
 * Mints the one-time page token + WebView URL (createToken), and exchanges the
 * token for the rb_pay session cookie (exchange) from the same-origin `/pay`
 * bootstrap route. The port is reached through PaymentRepository; no
 * infrastructure import.
 */
import { useCallback, useMemo } from "react";

import { OpenPaymentWebView } from "@application/payment/open-payment-webview.use-case";
import type { PageToken } from "@domain/repositories/payment.repository";
import { useServices } from "@providers/service-context";

export function usePaymentWebView(): {
  createToken: (bookingId: string) => Promise<PageToken>;
  exchange: (pageToken: string) => Promise<void>;
} {
  const { paymentRepository } = useServices();
  const usecase = useMemo(
    () => new OpenPaymentWebView(paymentRepository),
    [paymentRepository],
  );
  const createToken = useCallback(
    (bookingId: string) => usecase.createToken(bookingId),
    [usecase],
  );
  const exchange = useCallback(
    (pageToken: string) => usecase.exchange(pageToken),
    [usecase],
  );
  return {
    createToken,
    exchange,
  };
}
