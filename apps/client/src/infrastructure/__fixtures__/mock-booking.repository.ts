/**
 * MockBookingRepository — in-memory adapter for `BookingRepository`.
 *
 * Bound under `EXPO_PUBLIC_USE_MOCKS`. Framework-free, deterministic. Reuses the
 * idempotency key so a repeated `hold` for the same key returns the same
 * booking (idempotent). RBT-014 may enrich the scenarios.
 */
import type {
  AttendeeCheck,
  Booking,
  BookingItemInput,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";

export class MockBookingRepository implements BookingRepository {
  private current: BookingSession | null = null;
  private readonly bookingsByKey = new Map<string, Booking>();
  private seq = 0;

  async createSession(eventId: string): Promise<BookingSession> {
    this.seq += 1;
    this.current = {
      sessionId: `sess-${eventId}-${this.seq}`,
      eventId,
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
      serverTime: new Date().toISOString(),
      maxSelectable: 3,
    };
    return this.current;
  }

  async getCurrentSession(): Promise<BookingSession | null> {
    return this.current;
  }

  /**
   * Deterministic mock verdict by NIK suffix so the FE can exercise every
   * branch without the BE (RBT-052 AC2): `...00` → ALREADY_REGISTERED (blocks),
   * `...99` → CHECK_LIMIT_REACHED (warns), anything else → AVAILABLE.
   */
  async checkAttendee(_sessionId: string, nik: string): Promise<AttendeeCheck> {
    const result: AttendeeCheck["result"] = nik.endsWith("00")
      ? "ALREADY_REGISTERED"
      : nik.endsWith("99")
        ? "CHECK_LIMIT_REACHED"
        : "AVAILABLE";
    return {
      nikMasked: `${nik.slice(0, 2)}****${nik.slice(-2)}`,
      result,
      checksRemaining: result === "CHECK_LIMIT_REACHED" ? 0 : 5,
    };
  }

  /**
   * FE-NEED (O1) mock: record ONLY that a buyer was set, with the MASKED NIK —
   * never the raw NIK (SECURITY §3). Deterministic + framework-free.
   */
  private buyerSet: { nikMasked: string; email: string } | null = null;
  async setBuyer(
    _sessionId: string,
    buyerNik: string,
    email: string,
  ): Promise<void> {
    this.buyerSet = {
      nikMasked: `${buyerNik.slice(0, 2)}****${buyerNik.slice(-2)}`,
      email,
    };
  }

  /** Test/diagnostic read of the last set buyer (masked). */
  getBuyerSet(): { nikMasked: string; email: string } | null {
    return this.buyerSet;
  }

  async hold(
    sessionId: string,
    items: readonly BookingItemInput[],
    idempotencyKey: string,
  ): Promise<Booking> {
    const existing = this.bookingsByKey.get(idempotencyKey);
    if (existing) return existing;
    this.seq += 1;
    const booking: Booking = {
      bookingId: `bk-${sessionId}-${this.seq}`,
      sessionId,
      status: "HELD",
      amountMinor: items.length * 45000000,
      serverTime: new Date().toISOString(),
    };
    this.bookingsByKey.set(idempotencyKey, booking);
    return booking;
  }
}
