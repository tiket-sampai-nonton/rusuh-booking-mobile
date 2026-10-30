/**
 * Booking-session use cases (application layer — framework-free).
 *
 * GetCurrentSession restores the active session (survives refresh, RBT-050);
 * CreateBookingSession creates one from an event (used by the waiting-room
 * auto-claim too, but kept here for the checkout restore path).
 */
import type {
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";

export class GetCurrentSession {
  constructor(private readonly booking: BookingRepository) {}

  execute(): Promise<BookingSession | null> {
    return this.booking.getCurrentSession();
  }
}
