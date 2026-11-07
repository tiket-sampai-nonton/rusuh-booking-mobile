/**
 * Event-detail CTA rule — pure domain (framework-free).
 *
 * Maps a contract `EventStatus` to the primary call-to-action the detail screen
 * renders (prototype event.html `joinBtn`): the button is ENABLED and reads
 * "Masuk Antrean" only when the event is AVAILABLE (the anonymous queue/booking
 * entry, D8.5); every other status disables it with a status-specific label —
 * SOLD_OUT → "Tiket Habis", NOT_STARTED → "Belum Dibuka", CLOSED → "Penjualan
 * Ditutup". Kept pure so the status→label/enabled derivation is unit-testable
 * without rendering.
 */
import type { EventStatus } from "@domain/repositories/event.repository";

/** Why the CTA is in its current state — drives copy + any downstream intent. */
export type CtaIntent = "join" | "soldout" | "soon" | "closed";

export interface EventCta {
  /** True only when the user can start the queue/booking flow (AVAILABLE). */
  readonly enabled: boolean;
  /** User-facing Bahasa label. */
  readonly label: string;
  /** Semantic reason for the state. */
  readonly intent: CtaIntent;
}

/**
 * Resolve the detail-screen CTA for an event status. Unknown values fall back
 * to the safe disabled "Penjualan Ditutup" state so a contract drift never
 * exposes a live booking button.
 */
export function ctaFor(status: EventStatus): EventCta {
  switch (status) {
    case "AVAILABLE":
      return { enabled: true, label: "Masuk Antrean", intent: "join" };
    case "SOLD_OUT":
      return { enabled: false, label: "Tiket Habis", intent: "soldout" };
    case "NOT_STARTED":
      return { enabled: false, label: "Belum Dibuka", intent: "soon" };
    case "CLOSED":
      return { enabled: false, label: "Penjualan Ditutup", intent: "closed" };
    case "CANCELLED":
      return { enabled: false, label: "Event Dibatalkan", intent: "closed" };
    default:
      return { enabled: false, label: "Penjualan Ditutup", intent: "closed" };
  }
}
