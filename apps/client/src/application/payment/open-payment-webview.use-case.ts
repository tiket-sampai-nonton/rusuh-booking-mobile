/**
 * OpenPaymentWebView use case (application — framework-free) — RBT-062.
 *
 * Mobile page-token handoff (D10.3, FE-NEED O2): mint a one-time page token +
 * WebView URL, so the app can load `pageUrl` in a WebView and then exchange the
 * token for the `rb_pay` session cookie — reusing the SAME FE payment page
 * inside the WebView with the server-authoritative timer intact. The exchange
 * is modelled here as a step the WebView triggers on load; the use case keeps
 * both calls on the frozen port. No React / RN / Expo imports.
 */
import type {
  PageToken,
  PaymentRepository,
} from "@domain/repositories/payment.repository";

export class OpenPaymentWebView {
  constructor(private readonly payment: PaymentRepository) {}

  /** Mint the page token + URL for the mobile WebView. */
  createToken(bookingId: string): Promise<PageToken> {
    return this.payment.createPageToken(bookingId);
  }

  /** Exchange the one-time token for the rb_pay session cookie (on WebView load). */
  exchange(pageToken: string): Promise<void> {
    return this.payment.exchangePageToken(pageToken);
  }
}
