/**
 * ListEvents use case (application layer — framework-free).
 *
 * Orchestrates the catalog read: fetch events through the `EventRepository`
 * port, then derive the upcoming/history split on the SERVER clock (never the
 * device clock). The presentation hook (`useEvents`) is the only caller; it
 * names no repository.
 *
 * No React / RN / Expo imports (ARCHITECTURE dependency rule).
 */
import type {
  EventQuery,
  EventRepository,
} from "@domain/repositories/event.repository";
import { splitCatalog, type CatalogSplit } from "@domain/rules/event-display";
import type { ServerClock } from "@domain/services/server-clock";
import { catalogQuarter } from "@domain/rules/catalog-quarter";

export class ListEvents {
  constructor(
    private readonly events: EventRepository,
    private readonly clock: ServerClock,
  ) {}

  /**
   * Fetch + split the catalog into upcoming (soonest first) and history (most
   * recent first). The split is taken on the server-authoritative clock so a
   * skewed device clock never miscategorises an event.
   */
  async execute(query?: EventQuery, quarter = false): Promise<CatalogSplit> {
    // A catalog response anchors the clock before computing a WIB date range.
    if (quarter && this.events.supportsServerFilters) {
      await this.events.listEvents({ timeframe: "ALL" });
      if (!this.clock.isSynchronized()) {
        throw new Error("Waktu server belum tersedia. Silakan coba lagi.");
      }
    }
    const effectiveQuery =
      quarter && this.events.supportsServerFilters
        ? { ...query, ...catalogQuarter(this.clock.serverNow()) }
        : query;
    const list = effectiveQuery
      ? await this.events.listEvents(effectiveQuery)
      : await this.events.listEvents();
    const split = splitCatalog(list, this.clock.serverNow());
    if (!effectiveQuery || !this.events.supportsServerFilters) return split;
    return {
      upcoming: list,
      history: split.history,
    };
  }
}
