import type {
  EventQuery,
  EventRepository,
} from "@domain/repositories/event.repository";
import { catalogQuarter } from "@domain/rules/catalog-quarter";
import { inTimeBucket } from "@domain/rules/catalog-time-window";
import { splitCatalog } from "@domain/rules/event-display";
import type { ServerClock } from "@domain/services/server-clock";

/** Fetch available choices without the selected genre so it can be changed. */
export class ListEventFacets {
  constructor(
    private readonly events: EventRepository,
    private readonly clock: ServerClock,
  ) {}

  async execute(query: EventQuery, quarter = false) {
    if (quarter && this.events.supportsServerFilters) {
      await this.events.listEvents({ timeframe: "ALL" });
      if (!this.clock.isSynchronized())
        throw new Error("Waktu server belum tersedia. Silakan coba lagi.");
    }
    const { genres: _genres, sort: _sort, ...other } = query;
    const filters =
      quarter && this.events.supportsServerFilters
        ? { ...other, ...catalogQuarter(this.clock.serverNow()) }
        : other;
    if (this.events.getFacets) return this.events.getFacets(filters);
    if (this.events.supportsServerFilters)
      throw new Error("Pilihan genre belum tersedia.");
    const events = await this.events.listEvents(filters);
    const now = this.clock.serverNow();
    const time = quarter
      ? "quarter"
      : filters.timeframe === "THIS_WEEK"
        ? "week"
        : filters.timeframe === "THIS_MONTH"
          ? "month"
          : "all";
    const visible = splitCatalog(events, now).upcoming.filter((event) =>
      inTimeBucket(event, time, now),
    );
    return {
      cities: [],
      genres: [
        ...new Set(visible.flatMap((event) => event.genres ?? [])),
      ].sort((left, right) => left.localeCompare(right, "id")),
    };
  }
}
