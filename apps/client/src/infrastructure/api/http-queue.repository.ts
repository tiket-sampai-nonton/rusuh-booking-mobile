/**
 * HttpQueueRepository — infrastructure/api (ARCHITECTURE §3; RBT-010).
 *
 * Implements `QueueRepository` over the `HttpClient` port. Join is anonymous
 * (FE-NEED O1). Unwraps the envelope + maps wire → domain.
 */

import type {
  QueueEntry,
  QueueRepository,
} from "@domain/repositories/queue.repository";
import { assertOk, unwrap } from "@infrastructure/api/envelope";
import { toQueueEntry } from "@infrastructure/api/dto-mappers";
import type { HttpClient } from "@infrastructure/http/http-client";

export class HttpQueueRepository implements QueueRepository {
  constructor(private readonly http: HttpClient) {}

  async join(eventId: string): Promise<QueueEntry> {
    const res = await this.http.request({
      method: "POST",
      url: "queue",
      body: { eventId },
    });
    return toQueueEntry(unwrap<Parameters<typeof toQueueEntry>[0]>(res));
  }

  async getStatus(queueId: string): Promise<QueueEntry> {
    const res = await this.http.request({
      method: "GET",
      url: `queue/${encodeURIComponent(queueId)}`,
    });
    return toQueueEntry(unwrap<Parameters<typeof toQueueEntry>[0]>(res));
  }

  async leave(queueId: string): Promise<void> {
    const res = await this.http.request({
      method: "DELETE",
      url: `queue/${encodeURIComponent(queueId)}`,
    });
    assertOk(res);
  }
}
