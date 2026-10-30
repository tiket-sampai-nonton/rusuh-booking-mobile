/**
 * BookingRepository — domain PORT (ARCHITECTURE §2.1, §3, §4.1; RBT-010 NEW).
 *
 * Pure TS: no React / RN / Expo / browser / native / codegen imports.
 * Infrastructure implements this port (`HttpBookingRepository`); the composition
 * root binds the concrete adapter.
 *
 * Covers the Booking service: booking-session create/restore, ticket holds,
 * attendee NIK checks, and the final booking. Consumed by the checkout use
 * cases (E6, RBT-050…054). Domain entities are minimal (ISP) — not wire DTOs.
 */

/** A booking session (the time-boxed hold within which the user selects). */
export interface BookingSession {
  readonly sessionId: string;
  readonly eventId: string;
  /** Server-authoritative hold deadline (ISO-8601). */
  readonly expiresAt: string;
  readonly serverTime?: string;
  /** Max tickets this session may select (quota rule). */
  readonly maxSelectable?: number;
}

/** Result of an attendee-NIK availability check (quota enforcement). */
export interface AttendeeCheck {
  readonly nikMasked: string;
  readonly result: "AVAILABLE" | "ALREADY_REGISTERED" | "CHECK_LIMIT_REACHED";
  readonly checksRemaining?: number;
}

/** A confirmed booking (post-hold), payable until its deadline. */
export interface Booking {
  readonly bookingId: string;
  readonly sessionId: string;
  readonly status: "HELD" | "CONFIRMED" | "PAID" | "EXPIRED" | "CANCELLED";
  readonly amountMinor: number;
  readonly serverTime?: string;
}

/** One selection row: category + attendee identity (NIK carried per ticket). */
export interface BookingItemInput {
  readonly categoryId: string;
  readonly attendeeName: string;
  readonly attendeeNik: string;
}

export interface BookingRepository {
  /** Create a booking session from an admission token. */
  createSession(eventId: string): Promise<BookingSession>;
  /** Restore the current session (survives refresh). */
  getCurrentSession(): Promise<BookingSession | null>;
  /** Check an attendee NIK's availability for this event. */
  checkAttendee(sessionId: string, nik: string): Promise<AttendeeCheck>;
  /**
   * Hold the selected items (idempotent).
   * @param idempotencyKey minted in the use case, reused on retry (§4.3).
   */
  hold(
    sessionId: string,
    items: readonly BookingItemInput[],
    idempotencyKey: string,
  ): Promise<Booking>;
}
