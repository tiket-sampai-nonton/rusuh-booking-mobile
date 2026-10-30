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
import type { EventRepository } from "@domain/repositories/event.repository";
import { splitCatalog, type CatalogSplit } from "@domain/rules/event-display";
import type { ServerClock } from "@domain/services/server-clock";

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
  async execute(): Promise<CatalogSplit> {
    const list = await this.events.listEvents();
    return splitCatalog(list, this.clock.serverNow());
  }
}
