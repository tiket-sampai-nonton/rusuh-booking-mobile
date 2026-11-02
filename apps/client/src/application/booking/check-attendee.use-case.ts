/**
 * CheckAttendee use case (application layer — framework-free).
 *
 * Asks the BE whether an attendee NIK may still be used for this event's
 * booking (quota enforcement, D9.1 / RBT-052 AC2). The result drives per-row
 * UX: ALREADY_REGISTERED blocks the row, CHECK_LIMIT_REACHED only warns.
 * The BE remains authoritative — this is an early, debounced UX signal.
 *
 * No React / RN / Expo imports (ARCHITECTURE dependency rule). TanStack / the
 * debounce live in the presentation hook, never here.
 */
import type {
  AttendeeCheck,
  BookingRepository,
} from "@domain/repositories/booking.repository";

export class CheckAttendee {
  constructor(private readonly booking: BookingRepository) {}

  /** Check `nik` for `sessionId`; throws to the caller on transport error. */
  async execute(sessionId: string, nik: string): Promise<AttendeeCheck> {
    return this.booking.checkAttendee(sessionId, nik);
  }
}
