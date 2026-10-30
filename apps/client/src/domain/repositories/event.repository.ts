/**
 * EventRepository — domain PORT (ARCHITECTURE §2.1, §3, §4.1).
 *
 * Pure TS interface: no React / React Native / Expo / browser / native imports.
 * Infrastructure implements this port (RBT-010 HttpEventRepository); the
 * composition root (`src/providers/container.ts`) binds the concrete adapter.
 *
 * The shapes below are intentionally minimal placeholders for RBT-004 wiring.
 * RBT-010 replaces them with OpenAPI-generated contract types.
 */

/** Minimal event summary placeholder — superseded by OpenAPI types in RBT-010. */
export interface EventSummary {
  readonly id: string;
  readonly name: string;
}

/** Minimal event detail placeholder — superseded by OpenAPI types in RBT-010. */
export interface EventDetail extends EventSummary {
  readonly startsAt: string;
}

export interface EventRepository {
  /** List the event catalog. */
  listEvents(): Promise<readonly EventSummary[]>;
  /** Fetch one event's detail by id. */
  getEventDetail(eventId: string): Promise<EventDetail>;
}
