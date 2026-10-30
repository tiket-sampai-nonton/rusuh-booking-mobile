/**
 * MockPaymentRepository — in-memory adapter for `PaymentRepository`.
 *
 * Bound by the composition root under `EXPO_PUBLIC_USE_MOCKS` (mock-first
 * payment, ARCHITECTURE §13 P5). Framework-free; deterministic. Reuses the
 * supplied idempotency key so a repeated create for the same key is idempotent.
 */
import type {
  PaymentAttempt,
  PaymentRepository,
} from "@domain/repositories/payment.repository";

export class MockPaymentRepository implements PaymentRepository {
  private readonly attemptsByKey = new Map<string, PaymentAttempt>();
  private readonly attemptsById = new Map<string, PaymentAttempt>();
  private seq = 0;

  async createAttempt(
    bookingId: string,
    idempotencyKey: string,
  ): Promise<PaymentAttempt> {
    const existing = this.attemptsByKey.get(idempotencyKey);
    if (existing) {
      return existing;
    }
    this.seq += 1;
    const attempt: PaymentAttempt = {
      attemptId: `pay-${bookingId}-${this.seq}`,
      status: "AWAITING_PAYMENT",
    };
    this.attemptsByKey.set(idempotencyKey, attempt);
    this.attemptsById.set(attempt.attemptId, attempt);
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
