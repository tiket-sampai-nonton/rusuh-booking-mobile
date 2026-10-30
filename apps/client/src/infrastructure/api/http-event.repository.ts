/**
 * HttpEventRepository — infrastructure/api (ARCHITECTURE §3; RBT-010).
 *
 * Implements the `EventRepository` domain port over the `HttpClient` transport
 * port. Unwraps the `{meta,data}` envelope and maps wire DTOs → domain entities.
 * Depends on NO concrete client (axios/fetch) — bound at the composition root.
 */

import type {
  EventDetail,
  EventRepository,
  EventSummary,
} from "@domain/repositories/event.repository";
import { unwrap } from "@infrastructure/api/envelope";
import { toEventDetail, toEventSummary } from "@infrastructure/api/dto-mappers";
import type { HttpClient } from "@infrastructure/http/http-client";

export class HttpEventRepository implements EventRepository {
  constructor(private readonly http: HttpClient) {}

  async listEvents(): Promise<readonly EventSummary[]> {
    const res = await this.http.request({ method: "GET", url: "events" });
    const data = unwrap<{ events: Parameters<typeof toEventSummary>[0][] }>(res);
    return data.events.map(toEventSummary);
  }

  async getEventDetail(eventId: string): Promise<EventDetail> {
    const res = await this.http.request({
      method: "GET",
      url: `events/${encodeURIComponent(eventId)}`,
    });
    return toEventDetail(unwrap<Parameters<typeof toEventDetail>[0]>(res));
  }
}
