/**
 * Default ticket categories (O2 BE-NEED gap — the real set + per-category
 * `priceMinor` arrive from the BE checkout-category contract). The prototype
 * `detail.html` computes the Total from `session.categories[].priceMinor`;
 * until that contract lands we carry a documented mock price per category so
 * the Total bar renders faithfully. Flagged as a mock (never a real quote).
 */
import type { TicketRow } from "@domain/rules/checkout";

export const CATEGORIES = [
  { id: "REG", label: "Reguler", priceMinor: 45000000 }, // Rp 450.000 (mock, O2)
  { id: "VIP", label: "VIP", priceMinor: 95000000 }, //     Rp 950.000 (mock, O2)
] as const;

export function categoryPrice(categoryId: string): number {
  return CATEGORIES.find((c) => c.id === categoryId)?.priceMinor ?? 0;
}

export function emptyRow(): TicketRow {
  return {
    categoryId: CATEGORIES[0].id,
    attendeeName: "",
    attendeeNik: "",
    useBuyerNik: false,
  };
}
