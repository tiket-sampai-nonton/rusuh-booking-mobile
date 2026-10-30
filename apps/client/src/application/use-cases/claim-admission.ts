/**
 * ClaimAdmission use case (application layer — framework-free).
 *
 * On admission the waiting room auto-claims (no button, FR-08) by creating a
 * booking session from the event. The returned `BookingSession` carries the
 * server-authoritative hold deadline; the caller routes to checkout with its
 * id. Framework-free; the hook owns the "when".
 */
import type {
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";

export class ClaimAdmission {
  constructor(private readonly booking: BookingRepository) {}

  execute(eventId: string): Promise<BookingSession> {
    return this.booking.createSession(eventId);
  }
}
