/**
 * CreatePaymentAttempt + VerifyPayment use cases (application — framework-free).
 *
 * CreatePaymentAttempt mints ONE Idempotency-Key per (booking, method) action
 * and calls the idempotent port (D10.2/FR-25) → returns the SNAP handoff
 * (redirectUrl), reusing the key across retry so a double-tap can't create two
 * attempts. VerifyPayment reads the AUTHORITATIVE status (never trust the
 * callback — D10.2/RBT-063). The FE never collects a payment instrument.
 * No React / RN / Expo imports (ARCHITECTURE dependency rule).
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

  /** Stable action id for a (booking, method) attempt — idempotency-key reuse. */
  static actionId(bookingId: string, method: PaymentMethod): string {
    return `attempt-${bookingId}-${method}`;
  }

  execute(bookingId: string, method: PaymentMethod): Promise<PaymentAttempt> {
    const key = this.keys.mint(
      CreatePaymentAttempt.actionId(bookingId, method),
    );
    return this.payment.createAttempt(bookingId, method, key);
  }
}

export class VerifyPayment {
  constructor(private readonly payment: PaymentRepository) {}

  execute(attemptId: string, bookingId?: string): Promise<PaymentAttempt> {
    return this.payment.getStatus(attemptId, bookingId);
  }
}
