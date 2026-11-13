import type { BookingRepository } from "@domain/repositories/booking.repository";

/** Releases an unsubmitted ticket-selection session through the booking port. */
export class CancelBookingSession {
  constructor(private readonly bookings: BookingRepository) {}

  async execute(sessionId: string): Promise<void> {
    await this.bookings.cancelSession?.(sessionId);
  }
}
