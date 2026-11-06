/**
 * SetBuyer use case (application layer — framework-free).
 *
 * Persists the buyer (NIK + email) on the booking session before the hold
 * (RBT-053 AC1). FE-NEED (O1): the endpoint is proposed, mocked until the BE
 * delivers it. No React / RN / Expo imports (ARCHITECTURE dependency rule).
 */
import type { BookingRepository } from "@domain/repositories/booking.repository";

export class SetBuyer {
  constructor(private readonly booking: BookingRepository) {}

  async execute(
    sessionId: string,
    buyerNik: string,
    email: string,
  ): Promise<void> {
    await this.booking.setBuyer(sessionId, buyerNik, email);
  }
}
