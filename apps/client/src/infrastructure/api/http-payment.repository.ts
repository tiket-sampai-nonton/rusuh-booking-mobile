/**
 * HttpPaymentRepository — infrastructure/api (ARCHITECTURE §3, §13 P5; RBT-010).
 *
 * Implements `PaymentRepository` over the `HttpClient` port. The FE only creates
 * an attempt and reads status — SNAP owns the instrument. The Idempotency-Key is
 * minted upstream (use case) and passed in; this adapter only forwards it as a
 * header (RBT-012 owns the mint/persist/reuse policy).
 */

import type {
  PaymentAttempt,
  PaymentMethod,
  PaymentPage,
  PaymentRepository,
} from "@domain/repositories/payment.repository";
import { unwrap } from "@infrastructure/api/envelope";
import {
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
}
