/**
 * HoldBooking use case (application layer — framework-free) — RBT-054.
 *
 * Maps the checkout form rows to the contract `BookingItemInput[]` (resolving a
 * "use buyer NIK" row to the buyer's selected identity), mints ONE Idempotency-Key for the
 * action and REUSES it across retry/refresh (RBT-012/FR-25) so a double-submit
 * cannot create a second booking, then calls the port's idempotent `hold`. The
 * key is cleared on success (terminal for this action). No React / RN / Expo
 * imports (ARCHITECTURE dependency rule); error mapping is the caller's hook.
 */
import { DomainError } from "@domain/errors/domain-error";
import { mapFailure } from "@domain/errors/error-mapper";
import type {
  Booking,
  BookingItemInput,
  BookingBuyerInput,
  BookingRepository,
} from "@domain/repositories/booking.repository";
import type { IdempotencyKeys } from "@domain/idempotency/idempotency-key";
import { resolveAttendeeNiks, type TicketRow } from "@domain/rules/checkout";

export class HoldBooking {
  constructor(
    private readonly booking: BookingRepository,
    private readonly keys: IdempotencyKeys,
  ) {}

  /** Stable action id for a session's hold — drives idempotency-key reuse. */
  static actionId(sessionId: string): string {
    return `hold-${sessionId}`;
  }

  async execute(
    sessionId: string,
    rows: readonly TicketRow[],
    buyerNik: string,
    buyer: BookingBuyerInput,
  ): Promise<Booking> {
    const resolved = resolveAttendeeNiks(rows, buyerNik);
    const items: BookingItemInput[] = rows.map((r, i) => {
      const useLoginNik = r.useBuyerNik && buyer.useLoginNik === true;
      return {
        categoryId: r.categoryId,
        attendeeName: r.attendeeName,
        ...(useLoginNik ? { useLoginNik: true } : { attendeeNik: resolved[i] }),
      };
    });
    const actionId = HoldBooking.actionId(sessionId);
    // Mint ONCE and reuse across retry (the key is NOT cleared on failure, so a
    // retry of the same action reuses it — FR-25). Cleared only on success.
    const key = this.keys.mint(actionId);
    try {
      const booking = await this.booking.hold(sessionId, items, key, buyer);
      this.keys.clear(actionId); // terminal → a NEW attempt gets a fresh key
      return booking;
    } catch (cause) {
      // Typed hold conflicts (CATEGORY_UNAVAILABLE / BUYER_QUOTA_EXHAUSTED /
      // QUANTITY_EXCEEDS_LIMIT / MIXED_CATEGORIES_NOT_ALLOWED /
      // ATTENDEE_NIK_DUPLICATE_IN_ORDER …) carry the code the UI needs — pass
      // through so the mapped Bahasa message surfaces (FR-16). The key is kept
      // so an honest retry is still idempotent.
      const error =
        cause instanceof DomainError
          ? cause
          : mapFailure(cause, "DEPENDENCY_UNAVAILABLE");
      // A saved NIK that is not linked is a rejected selection, so switching
      // to manual entry starts a new payload/action. Temporary dependency
      // failures intentionally retain the same key for safe retries.
      if (
        error.code === "IDEMPOTENCY_KEY_REUSED" ||
        error.code === "NIK_NOT_LINKED"
      )
        this.keys.clear(actionId);
      throw error;
    }
  }
}
