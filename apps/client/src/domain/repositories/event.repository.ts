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
export type EventStatus =
  | "NOT_STARTED"
  | "AVAILABLE"
  | "SOLD_OUT"
  | "CLOSED"
  | "CANCELLED";

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
  readonly imageUrl?: string;
  readonly bannerUrl?: string;
  readonly thumbnailUrl?: string;
  readonly genres?: readonly string[];
  /** Mock-only availability hint. The public catalog summary does not include stock. */
  readonly remainingTickets?: number;
}

/** Full event detail (adds rich description + pricing categories). */
export interface EventDetail extends EventSummary {
  readonly maxTicketsPerOrder?: number;
  readonly maxTicketsPerBuyerNik?: number;
  readonly allowMixedCategories?: boolean;
  readonly published?: boolean;
  /** Rich event content returned by the event detail response. */
  readonly description?: Readonly<Record<string, unknown>>;
}

export interface EventQuery {
  readonly timeframe?: "ALL" | "THIS_WEEK" | "THIS_MONTH" | "UPCOMING";
  readonly genres?: readonly string[];
  readonly city?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly status?: string;
  readonly sort?: "DATE_ASC" | "DATE_DESC" | "PRICE_ASC" | "PRICE_DESC";
}

export interface EventRepository {
  readonly supportsServerFilters?: boolean;
  /** Optional synchronous catalog seed for a static/mock first render. */
  getInitialEvents?(): readonly EventSummary[];
  /** List the event catalog (upcoming + history derived by the caller). */
  listEvents(query?: EventQuery): Promise<readonly EventSummary[]>;
  getFacets?(query?: EventQuery): Promise<{
    readonly cities: readonly string[];
    readonly genres: readonly string[];
  }>;
  /** Fetch one event's detail by id. */
  getEventDetail(eventId: string): Promise<EventDetail>;
}
