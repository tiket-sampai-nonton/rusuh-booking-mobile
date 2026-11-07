/**
 * MockPaymentRepository — in-memory adapter for `PaymentRepository`.
 *
 * Bound by the composition root under `EXPO_PUBLIC_USE_MOCKS` (mock-first
 * payment, ARCHITECTURE §13 P5). Framework-free; deterministic. Reuses the
 * supplied idempotency key so a repeated create for the same key is idempotent.
 */
import { mapError } from "@domain/errors/error-mapper";
import type {
  PageToken,
  PaymentAttempt,
  PaymentMethod,
  PaymentPage,
  PaymentRepository,
  SnapOutcome,
} from "@domain/repositories/payment.repository";

/** Server-allowed methods the mock page exposes (no credit card). */
const MOCK_METHODS: readonly PaymentMethod[] = [
  "VA_BCA",
  "VA_BNI",
  "VA_BRI",
  "VA_PERMATA",
  "QRIS",
  "GOPAY",
];

export class MockPaymentRepository implements PaymentRepository {
  private readonly attemptsByKey = new Map<string, PaymentAttempt>();
  private readonly attemptsById = new Map<string, PaymentAttempt>();
  private readonly attemptByBooking = new Map<string, PaymentAttempt>();
  private seq = 0;

  /**
   * GET /payments/{bookingId}/page (RBT-060). Server-authoritative summary +
   * method list + a 10-min deadline. amountMinor mirrors the checkout mock
   * (Rp 450.000 = one REG ticket); NO fee line. Restores `currentAttempt` when
   * one is already in flight for this booking (refresh-safe, RBT-061).
   */
  async getPaymentPage(bookingId: string): Promise<PaymentPage> {
    const now = Date.now();
    return {
      bookingId,
      methods: MOCK_METHODS,
      amountMinor: 45000000,
      paymentExpiresAt: new Date(now + 600_000).toISOString(),
      serverTime: new Date(now).toISOString(),
      currentAttempt: this.attemptByBooking.get(bookingId),
    };
  }

  async createAttempt(
    bookingId: string,
    _method: PaymentMethod,
    idempotencyKey: string,
  ): Promise<PaymentAttempt> {
    const existing = this.attemptsByKey.get(idempotencyKey);
    if (existing) {
      return existing;
    }
    this.seq += 1;
    const attempt: PaymentAttempt = {
      attemptId: `pay-${bookingId}-${this.seq}`,
      bookingId,
      status: "AWAITING_PAYMENT",
      // RBT-065: the local SNAP simulator route stands in for the hosted page.
      redirectUrl: `/snap/${bookingId}`,
      paymentExpiresAt: new Date(Date.now() + 600_000).toISOString(),
      serverTime: new Date().toISOString(),
      successReturnUrl: `/payment-result/${bookingId}`,
      failedReturnUrl: `/failed/${bookingId}?reason=payment&bookingId=${bookingId}`,
    };
    this.attemptsByKey.set(idempotencyKey, attempt);
    this.attemptsById.set(attempt.attemptId, attempt);
    this.attemptByBooking.set(bookingId, attempt);
    return attempt;
  }

  /** Per-attempt poll counter — drives the deterministic settle-to-PAID. */
  private readonly statusPolls = new Map<string, number>();

  /**
   * GET /payments/{attemptId}/status (RBT-063) — the AUTHORITATIVE read the FE
   * verifies against (never the callback). The mock settles a pending attempt
   * to PAID after 2 polls so the verify backoff poll deterministically
   * resolves; a terminal attempt stays terminal.
   */
  async getStatus(
    attemptId: string,
    bookingId?: string,
  ): Promise<PaymentAttempt> {
    const found =
      this.attemptsById.get(attemptId) ??
      (bookingId ? this.attemptByBooking.get(bookingId) : undefined);
    if (!found) {
      throw new Error(`MockPaymentRepository: unknown attempt ${attemptId}`);
    }
    if (found.status !== "AWAITING_PAYMENT" && found.status !== "READY") {
      return found;
    }
    const polls = (this.statusPolls.get(found.attemptId) ?? 0) + 1;
    this.statusPolls.set(found.attemptId, polls);
    if (polls < 2) return found;
    const paid: PaymentAttempt = { ...found, status: "PAID" };
    this.attemptsById.set(found.attemptId, paid);
    this.attemptByBooking.set(paid.bookingId, paid);
    return paid;
  }

  /**
   * SNAP callback (RBT-065) — the local simulator (or the real gateway webhook)
   * reports the hosted-page outcome. PAID/FAILED set the authoritative terminal
   * status; UNKNOWN leaves the attempt AWAITING_PAYMENT so the result gate keeps
   * verifying (D10.4). The FE still re-reads getStatus; this never renders PAID
   * on its own.
   */
  async snapCallback(
    attemptId: string,
    outcome: SnapOutcome,
  ): Promise<PaymentAttempt> {
    const found = this.attemptsById.get(attemptId);
    if (!found) {
      throw new Error(`MockPaymentRepository: unknown attempt ${attemptId}`);
    }
    let next = found;
    if (outcome !== "UNKNOWN") {
      const status = outcome === "PAID" ? "PAID" : "FAILED";
      next = { ...found, status };
    }
    this.attemptsById.set(attemptId, next);
    this.attemptByBooking.set(next.bookingId, next);
    // Also settle the deterministic poll so getStatus agrees immediately.
    if (outcome !== "UNKNOWN") this.statusPolls.set(attemptId, 2);
    return next;
  }

  /**
   * RBT-062 (FE-NEED O2): mint a one-time page token + a WebView URL that points
   * at the FE payment route (so the SAME page is reused inside the WebView).
   */
  private readonly liveTokens = new Set<string>();
  async createPageToken(bookingId: string): Promise<PageToken> {
    this.seq += 1;
    const pageToken = `pgt_${bookingId}_${this.seq}`;
    this.liveTokens.add(pageToken);
    return {
      pageToken,
      pageUrl: `/payment/${bookingId}?rb_pay_token=${pageToken}`,
    };
  }

  /** Exchange a one-time token (consumed); an unknown/used token is invalid. */
  async exchangePageToken(pageToken: string): Promise<void> {
    if (!this.liveTokens.delete(pageToken)) {
      throw mapError({ code: "PAYMENT_PAGE_TOKEN_INVALID" });
    }
  }
}
