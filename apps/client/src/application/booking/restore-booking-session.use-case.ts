/**
 * RestoreBookingSession use case (application layer — framework-free).
 *
 * Restores the current booking session after a refresh WITHOUT resetting its
 * `expiresAt` — the BE's `/booking-sessions/current` returns the same session
 * with its original server deadline, so the countdown continues from where it
 * really is (FR-18, D9.2). Returns null when there is no active session (the
 * caller then routes to expired / re-queue).
 *
 * No React / RN / Expo imports (ARCHITECTURE dependency rule).
 */
import type {
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";

export class RestoreBookingSession {
  constructor(private readonly booking: BookingRepository) {}

  /** Restore the active session, or null if none. */
  async execute(): Promise<BookingSession | null> {
    return this.booking.getCurrentSession();
  }
}
