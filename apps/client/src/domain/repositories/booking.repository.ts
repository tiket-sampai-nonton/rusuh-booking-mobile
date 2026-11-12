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
export interface BookingCategory {
  readonly categoryId: string;
  readonly code: string;
  readonly name: string;
  /** Minor-unit IDR integer from the Booking contract. */
  readonly priceMinor: number;
  readonly available: number;
}

/** Live category counts sent by the Booking availability SSE stream. */
export interface BookingAvailabilitySnapshot {
  readonly categories: readonly {
    readonly categoryId: string;
    readonly available: number;
  }[];
}

export interface BookingSession {
  readonly sessionId: string;
  readonly eventId: string;
  /** Server-authoritative hold deadline (ISO-8601). */
  readonly expiresAt: string;
  readonly serverTime?: string;
  /** Max tickets this session may select (quota rule). */
  readonly maxSelectable?: number;
  /** Ticket categories and current prices supplied by the Booking contract. */
  readonly categories: readonly BookingCategory[];
  readonly phase?: "SELECTING" | "EDITABLE" | "LOCKED" | "ENDED";
  readonly booking?: {
    readonly bookingId: string;
    readonly status: string;
    readonly amountMinor: number;
  } | null;
}

/** Result of an attendee-NIK availability check (quota enforcement). */
export interface AttendeeCheck {
  /** Optional: BE attendee-check responses intentionally omit identity data. */
  readonly nikMasked?: string;
  readonly result: "AVAILABLE" | "ALREADY_REGISTERED" | "CHECK_LIMIT_REACHED";
  readonly checksRemaining?: number;
}

/** A confirmed booking (post-hold), payable until its deadline. */
export interface Booking {
  readonly bookingId: string;
  readonly sessionId?: string;
  readonly status:
    | "HELD"
    | "CONFIRMED"
    | "PENDING_PAYMENT"
    | "VERIFYING"
    | "REVIEW"
    | "PAID"
    | "EXPIRED"
    | "CANCELLED";
  readonly amountMinor: number;
  readonly serverTime?: string;
  readonly version?: number;
  readonly canEdit?: boolean;
  readonly paymentExpiresAt?: string;
}

/** One selection row: category + attendee identity (NIK carried per ticket). */
export interface BookingItemInput {
  readonly categoryId: string;
  readonly attendeeName: string;
  /** Omitted when the logged-in buyer's linked NIK is used. */
  readonly attendeeNik?: string;
  readonly useLoginNik?: boolean;
}

export interface BookingBuyerInput {
  /** Omitted when useLoginNik is true. */
  readonly nik?: string;
  readonly useLoginNik?: boolean;
  readonly email: string;
  readonly emailConfirmation: string;
  readonly consent: boolean;
}

export interface BookingRepository {
  /** Create a booking session from an admission token. */
  createSession(admissionToken: string): Promise<BookingSession>;
  /** Restore the current session (survives refresh). */
  getCurrentSession(eventId?: string): Promise<BookingSession | null>;
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
    buyer: BookingBuyerInput,
  ): Promise<Booking>;
  cancelSession?(sessionId: string): Promise<void>;
  getSession?(sessionId: string): Promise<BookingSession>;
  subscribeAvailability?(
    sessionId: string,
    onAvailability: (snapshot: BookingAvailabilitySnapshot) => void,
  ): () => void;
  getBooking?(bookingId: string): Promise<Booking>;
  cancelBooking?(bookingId: string): Promise<Booking>;
  replaceItems?(
    bookingId: string,
    version: number,
    items: readonly BookingItemInput[],
    idempotencyKey: string,
  ): Promise<Booking>;
}
