/**
 * HttpEventRepository — infrastructure/api (ARCHITECTURE §3; RBT-010).
 *
 * Implements the `EventRepository` domain port over the `HttpClient` transport
 * port. Unwraps the `{meta,data}` envelope, syncs the contract server clock, and
 * maps wire DTOs → domain entities. Depends on NO concrete HTTP client.
 */

import type {
  EventDetail,
  EventRepository,
  EventSummary,
  EventQuery,
} from "@domain/repositories/event.repository";
import type { ServerClock } from "@domain/services/server-clock";
import { unwrap } from "@infrastructure/api/envelope";
import { toEventDetail, toEventSummary } from "@infrastructure/api/dto-mappers";
import type { HttpClient } from "@infrastructure/http/http-client";

export class HttpEventRepository implements EventRepository {
  readonly supportsServerFilters = true;
  constructor(
    private readonly http: HttpClient,
    private readonly serverClock: ServerClock,
  ) {}

  async listEvents(query?: EventQuery): Promise<readonly EventSummary[]> {
    const res = await this.http.request({
      method: "GET",
      url: eventUrl("events", query),
    });
    const data = unwrap<{
      events: Parameters<typeof toEventSummary>[0][];
      serverTime: string;
    }>(res);
    this.serverClock.sync(data.serverTime);
    return data.events.map(toEventSummary);
  }

  async getFacets(
    query?: EventQuery,
  ): Promise<{ cities: string[]; genres: string[] }> {
    const { sort: _sort, ...filters } = query ?? {};
    const res = await this.http.request({
      method: "GET",
      url: eventUrl("events/facets", filters),
    });
    return unwrap<{ cities: string[]; genres: string[] }>(res);
  }

  async getEventDetail(eventId: string): Promise<EventDetail> {
    const res = await this.http.request({
      method: "GET",
      url: `events/${encodeURIComponent(eventId)}`,
    });
    return toEventDetail(unwrap<Parameters<typeof toEventDetail>[0]>(res));
  }
}

function eventUrl(path: string, query?: EventQuery): string {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
      else if (typeof value === "string" && value) params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
