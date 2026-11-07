/**
 * usePaymentWebView — mobile page-token WebView seam (RBT-062).
 *
 * Mints the one-time page token + WebView URL (createToken), and exchanges the
 * token for the rb_pay session cookie (exchange) once the WebView reports it
 * loaded `pageUrl`. TanStack/the port are reached via the frozen
 * PaymentRepository (useServices); no infrastructure import. The actual
 * <WebView> component lives in the Payment WebView screen — this hook is the
 * framework-light data seam it drives.
 */
import { useMemo } from "react";

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
  return {
    createToken: (bookingId) => usecase.createToken(bookingId),
    exchange: (pageToken) => usecase.exchange(pageToken),
  };
}
