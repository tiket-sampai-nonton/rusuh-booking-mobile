/**
 * CreatePaymentAttempt + VerifyPayment use cases (application — framework-free).
 *
 * CreatePaymentAttempt mints ONE Idempotency-Key per (booking, method) action
 * and calls the idempotent port (D10.2/FR-25) → returns the SNAP handoff
 * (redirectUrl). VerifyPayment reads the authoritative status (never trust the
 * callback — D10.2/RBT-063). The FE never collects a payment instrument.
 */
import type { IdempotencyKeys } from "@domain/idempotency/idempotency-key";
import type {
  PaymentAttempt,
  PaymentMethod,
  PaymentRepository,
} from "@domain/repositories/payment.repository";

export class CreatePaymentAttempt {
  constructor(
    private readonly payment: PaymentRepository,
    private readonly keys: IdempotencyKeys,
  ) {}

  execute(bookingId: string, method: PaymentMethod): Promise<PaymentAttempt> {
    const key = this.keys.mint(`attempt-${bookingId}-${method}`);
    return this.payment.createAttempt(bookingId, method, key);
  }
}

export class VerifyPayment {
  constructor(private readonly payment: PaymentRepository) {}

  execute(attemptId: string): Promise<PaymentAttempt> {
    return this.payment.getStatus(attemptId);
  }
}
