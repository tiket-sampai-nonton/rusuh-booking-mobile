/**
 * MockPaymentRepository — in-memory adapter for `PaymentRepository`.
 *
 * Bound by the composition root under `EXPO_PUBLIC_USE_MOCKS` (mock-first
 * payment, ARCHITECTURE §13 P5). Framework-free; deterministic. Reuses the
 * supplied idempotency key so a repeated create for the same key is idempotent.
 */
import type {
  PaymentAttempt,
  PaymentMethod,
  PaymentPage,
  PaymentRepository,
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
      redirectUrl: `https://snap.mock/${bookingId}`,
      paymentExpiresAt: new Date(Date.now() + 600_000).toISOString(),
      serverTime: new Date().toISOString(),
    };
    this.attemptsByKey.set(idempotencyKey, attempt);
    this.attemptsById.set(attempt.attemptId, attempt);
    this.attemptByBooking.set(bookingId, attempt);
    return attempt;
  }

  async getStatus(attemptId: string): Promise<PaymentAttempt> {
    const found = this.attemptsById.get(attemptId);
    if (!found) {
      throw new Error(`MockPaymentRepository: unknown attempt ${attemptId}`);
    }
    return found;
  }
}
