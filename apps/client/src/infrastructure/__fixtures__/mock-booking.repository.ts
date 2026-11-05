/**
 * MockBookingRepository — in-memory adapter for `BookingRepository`.
 *
 * Bound under `EXPO_PUBLIC_USE_MOCKS`. Framework-free, deterministic. Reuses the
 * idempotency key so a repeated `hold` for the same key returns the same
 * booking (idempotent). RBT-014 may enrich the scenarios.
 */
import { mapError } from "@domain/errors/error-mapper";
import type {
  AttendeeCheck,
  Booking,
  BookingItemInput,
  BookingRepository,
  BookingSession,
} from "@domain/repositories/booking.repository";
import { BOOKING_CATEGORY_FIXTURE } from "@shared/test-fixtures/booking-categories.fixture";

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
      categories: BOOKING_CATEGORY_FIXTURE,
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
    const result = attendeeResultForNik(nik);
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
    if (existing) return existing; // idempotent: same key → same booking

    // Deterministic conflict triggers so the FE can exercise every hold error
    // path without the BE (RBT-054, FR-16). A real BE enforces these.
    const selectedCategories = new Set(items.map((i) => i.categoryId));
    const niks = items.map((i) => i.attendeeNik);
    if (items.some((i) => i.categoryId === "SOLD")) {
      throw mapError({ code: "CATEGORY_UNAVAILABLE" });
    }
    if (selectedCategories.size > 1) {
      throw mapError({ code: "MIXED_CATEGORIES_NOT_ALLOWED" });
    }
    if (new Set(niks).size !== niks.length) {
      throw mapError({ code: "ATTENDEE_NIK_DUPLICATE_IN_ORDER" });
    }
    if (items.length > 3) {
      throw mapError({ code: "QUANTITY_EXCEEDS_LIMIT" });
    }
    this.seq += 1;
    const bookingCategories = this.current?.categories ?? [];
    const amountMinor = items.reduce((sum, item) => {
      const category = bookingCategories.find(
        (candidate) =>
          candidate.categoryId === item.categoryId || candidate.code === item.categoryId,
      );
      return sum + (category?.priceMinor ?? 0);
    }, 0);
    const booking: Booking = {
      bookingId: `bk-${sessionId}-${this.seq}`,
      sessionId,
      status: "HELD",
      amountMinor,
      serverTime: new Date().toISOString(),
    };
    this.bookingsByKey.set(idempotencyKey, booking);
    return booking;
  }
}

function attendeeResultForNik(nik: string): AttendeeCheck["result"] {
  if (nik.endsWith("00")) return "ALREADY_REGISTERED";
  if (nik.endsWith("99")) return "CHECK_LIMIT_REACHED";
  return "AVAILABLE";
}
