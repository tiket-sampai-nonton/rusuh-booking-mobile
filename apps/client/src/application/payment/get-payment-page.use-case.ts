/**
 * GetPaymentPage use case (application layer — framework-free) — RBT-060.
 *
 * Fetches the server-authoritative payment page for a booking (summary +
 * allowed methods + deadline). The FE renders exactly `amountMinor` (no fee
 * line, D10.1) and the SERVER `methods` list. No React / RN / Expo imports.
 */
import type {
  PaymentPage,
  PaymentRepository,
} from "@domain/repositories/payment.repository";

export class GetPaymentPage {
  constructor(private readonly payment: PaymentRepository) {}

  execute(bookingId: string): Promise<PaymentPage> {
    return this.payment.getPaymentPage(bookingId);
  }
}
