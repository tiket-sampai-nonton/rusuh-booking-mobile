import type { BookingCategory } from "@domain/repositories/booking.repository";
import type { TicketRow } from "@domain/rules/checkout";

export function categoryPrice(
  categoryId: string,
  categories: readonly BookingCategory[],
): number {
  return categories.find((category) => category.categoryId === categoryId)?.priceMinor ?? 0;
}

/**
 * Mint a stable per-row id for React list reconciliation. Client-side only
 * (uniqueness within a form, not a security token) — same lightweight
 * `Date.now()` + `Math.random()` hex approach as the idempotency-key generator.
 */
function newRowId(): string {
  return `row_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 8)}`;
}

export function emptyRow(categoryId: string): TicketRow {
  return {
    rowId: newRowId(),
    categoryId,
    attendeeName: "",
    attendeeNik: "",
    useBuyerNik: false,
  };
}
