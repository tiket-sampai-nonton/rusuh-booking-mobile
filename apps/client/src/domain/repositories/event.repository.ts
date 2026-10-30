/**
 * EventRepository — domain PORT (ARCHITECTURE §2.1, §3, §4.1).
 *
 * Pure TS interface: no React / React Native / Expo / browser / native / codegen
 * imports. Infrastructure implements this port (`HttpEventRepository`); the
 * composition root binds the concrete adapter.
 *
 * RBT-010: shapes refined to the Booking-service event contract (EventSummary /
 * EventDetail). These are DOMAIN entities — minimal, business-meaningful fields
 * the app needs (ISP) — NOT a 1:1 copy of the generated wire DTO. The
 * DTO→domain mapping lives in `infrastructure/api/dto-mappers.ts`.
 */

/** Lifecycle status of an event (contract enum). */
export type EventStatus = "NOT_STARTED" | "AVAILABLE" | "SOLD_OUT" | "CLOSED";

/** Event as shown in the catalog/list. */
export interface EventSummary {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly venue?: string;
  /** ISO-8601; optional until scheduled. */
  readonly startsAt?: string;
  readonly salesStartsAt: string;
  readonly salesEndsAt: string;
  readonly status: EventStatus;
  /** Minor-unit IDR (integer). Undefined when not yet priced. */
  readonly minPriceMinor?: number;
  /** FE-NEED (O1): mocked until BE delivers on the list summary. */
  readonly remainingTickets?: number;
}

/** Full event detail (adds rich description + pricing categories). */
export interface EventDetail extends EventSummary {
  /**
   * FE-NEED (O1): rich description JSON (longDesc, lineup, terms, bannerImage).
   * Modeled as an opaque record until the BE `EventDetail.description` lands.
   */
  readonly description?: Readonly<Record<string, unknown>>;
}

export interface EventRepository {
  /** List the event catalog (upcoming + history derived by the caller). */
  listEvents(): Promise<readonly EventSummary[]>;
  /** Fetch one event's detail by id. */
  getEventDetail(eventId: string): Promise<EventDetail>;
}
