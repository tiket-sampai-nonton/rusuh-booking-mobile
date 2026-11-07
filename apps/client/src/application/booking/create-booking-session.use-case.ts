/**
 * CreateBookingSession use case (application layer — framework-free).
 *
 * Creates a booking session (the time-boxed ticket-selection hold) from the
 * admission the user earned in the waiting room, via the `BookingRepository`
 * port. The BE returns the server-authoritative `expiresAt` + `serverTime`; the
 * presentation countdown (useServerCountdown) renders the deadline from the
 * ServerClock, never the device clock (FR-17/18/19, D9.2).
 *
 * No React / RN / Expo imports (ARCHITECTURE dependency rule). The hook
 * (useBookingSession) is the only caller; it names no repository.
 */
import type {
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";

export class CreateBookingSession {
  constructor(private readonly booking: BookingRepository) {}

  /** Exchange the one-use queue admission token for a booking session. */
  async execute(admissionToken: string): Promise<BookingSession> {
    return this.booking.createSession(admissionToken);
  }
}
