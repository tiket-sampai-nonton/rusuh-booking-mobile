/**
 * HoldBooking + CheckAttendee use cases (application layer — framework-free).
 *
 * HoldBooking maps the checkout form rows to the contract `BookingItemInput[]`
 * (resolving a "use buyer NIK" row to the buyer's NIK), mints ONE Idempotency-
 * Key for the action (reused across retry/refresh — RBT-012/FR-25), and calls
 * the port's idempotent `hold`. CheckAttendee runs the debounced NIK
 * availability check (RBT-052).
 */
import type {
  AttendeeCheck,
  Booking,
  BookingItemInput,
  BookingRepository,
} from "@domain/repositories/booking.repository";
import type { IdempotencyKeys } from "@domain/idempotency/idempotency-key";
import { resolveAttendeeNiks, type TicketRow } from "@domain/rules/checkout";

export class CheckAttendee {
  constructor(private readonly booking: BookingRepository) {}

  execute(sessionId: string, nik: string): Promise<AttendeeCheck> {
    return this.booking.checkAttendee(sessionId, nik);
  }
}

export class HoldBooking {
  constructor(
    private readonly booking: BookingRepository,
    private readonly keys: IdempotencyKeys,
  ) {}

  /**
   * Hold the selected rows. The idempotency key is derived from the session id
   * so a retry/refresh of the SAME session reuses it (no second booking).
   */
  async execute(
    sessionId: string,
    rows: readonly TicketRow[],
    buyerNik: string,
  ): Promise<Booking> {
    const resolved = resolveAttendeeNiks(rows, buyerNik);
    const items: BookingItemInput[] = rows.map((r, i) => ({
      categoryId: r.categoryId,
      attendeeName: r.useBuyerNik ? "Pembeli" : r.attendeeName,
      attendeeNik: resolved[i],
    }));
    const actionId = `hold-${sessionId}`;
    const key = this.keys.mint(actionId);
    const booking = await this.booking.hold(sessionId, items, key);
    // The hold succeeded and is terminal for this key — clear it so a NEW
    // booking attempt (after an explicit restart) gets a fresh key.
    this.keys.clear(actionId);
    return booking;
  }
}
