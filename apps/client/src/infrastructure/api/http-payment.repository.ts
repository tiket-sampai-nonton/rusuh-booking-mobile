/**
 * HttpPaymentRepository — infrastructure/api (ARCHITECTURE §3, §13 P5; RBT-010).
 *
 * Implements `PaymentRepository` over the `HttpClient` port. The FE only creates
 * an attempt and reads status — SNAP owns the instrument. The Idempotency-Key is
 * minted upstream (use case) and passed in; this adapter only forwards it as a
 * header (RBT-012 owns the mint/persist/reuse policy).
 */

import type {
  PageToken,
  PaymentAttempt,
  PaymentMethod,
  PaymentPage,
  PaymentRepository,
  SnapOutcome,
} from "@domain/repositories/payment.repository";
import { unwrap } from "@infrastructure/api/envelope";
import {
  toPageToken,
  toPaymentAttempt,
  toPaymentPage,
} from "@infrastructure/api/dto-mappers";
import type { HttpClient } from "@infrastructure/http/http-client";

export class HttpPaymentRepository implements PaymentRepository {
  constructor(private readonly http: HttpClient) {}

  async getPaymentPage(bookingId: string): Promise<PaymentPage> {
    const res = await this.http.request({
      method: "GET",
      url: `payments/${encodeURIComponent(bookingId)}/page`,
    });
    return toPaymentPage(unwrap<Parameters<typeof toPaymentPage>[0]>(res));
  }

  async createAttempt(
    bookingId: string,
    method: PaymentMethod,
    idempotencyKey: string,
  ): Promise<PaymentAttempt> {
    const res = await this.http.request({
      method: "POST",
      url: `bookings/${encodeURIComponent(bookingId)}/payments/attempts`,
      headers: { "idempotency-key": idempotencyKey },
      body: { method },
    });
    return toPaymentAttempt(unwrap<Parameters<typeof toPaymentAttempt>[0]>(res));
  }

  async getStatus(attemptId: string): Promise<PaymentAttempt> {
    const res = await this.http.request({
      method: "GET",
      url: `payments/attempts/${encodeURIComponent(attemptId)}`,
    });
    return toPaymentAttempt(unwrap<Parameters<typeof toPaymentAttempt>[0]>(res));
  }

  async createPageToken(bookingId: string): Promise<PageToken> {
    const res = await this.http.request({
      method: "POST",
      url: `payments/${encodeURIComponent(bookingId)}/page-tokens`,
    });
    return toPageToken(unwrap<Parameters<typeof toPageToken>[0]>(res));
  }

  async exchangePageToken(pageToken: string): Promise<void> {
    // Sets the rb_pay session cookie server-side; no payload needed back.
    await this.http.request({
      method: "POST",
      url: "payment-page-sessions",
      body: { pageToken },
    });
  }

  async snapCallback(
    attemptId: string,
    outcome: SnapOutcome,
  ): Promise<PaymentAttempt> {
    // POST the SNAP callback; the BE webhook sets the authoritative status and
    // returns the (contract-shaped) attempt. The FE still re-verifies via
    // getStatus — the callback is never trusted on its own (D10.2).
    const res = await this.http.request({
      method: "POST",
      url: `payments/attempts/${encodeURIComponent(attemptId)}/snap-callback`,
      body: { outcome },
    });
    return toPaymentAttempt(unwrap<Parameters<typeof toPaymentAttempt>[0]>(res));
  }
}
