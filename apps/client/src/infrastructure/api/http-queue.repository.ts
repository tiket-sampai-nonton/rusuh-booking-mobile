import type { TokenStorage } from "@domain/auth/token-storage.port";
import type {
  QueueEntry,
  QueueRepository,
  QueueStatus,
  QueueStatusSnapshot,
  QueueZone,
} from "@domain/repositories/queue.repository";
import { assertOk, unwrap } from "@infrastructure/api/envelope";
import type { HttpClient } from "@infrastructure/http/http-client";

type QueueWire = {
  entryId: string;
  status: QueueStatus;
  state?: QueueStatus | "STALE";
  rank?: number | null;
  exactPosition?: number | null;
  zone?: QueueZone;
  serverTime?: string;
  visitorToken?: string;
  reason?: string;
};

export class HttpQueueRepository implements QueueRepository {
  constructor(
    private readonly http: HttpClient,
    private readonly visitorTokens?: TokenStorage,
  ) {}

  async join(eventId: string): Promise<QueueEntry> {
    const res = await this.http.request({
      method: "POST",
      url: `events/${encodeURIComponent(eventId)}/queue-entries`,
    });
    const data = unwrap<QueueWire>(res);
    if (data.visitorToken) await this.visitorTokens?.save(data.visitorToken);
    return this.toEntry(data, eventId);
  }

  async getStatus(queueId: string, eventId?: string): Promise<QueueEntry> {
    if (!eventId) throw new Error("Event ID is required to read queue status");
    const res = await this.http.request({
      method: "GET",
      url: `queue-entries/me?eventId=${encodeURIComponent(eventId)}`,
    });
    const data = unwrap<QueueWire>(res);
    if (data.entryId !== queueId)
      throw new Error("Queue membership does not match the current visitor");
    return this.toEntry(data, eventId);
  }

  async getQueueStatus(eventId: string): Promise<QueueStatusSnapshot> {
    const res = await this.http.request<{
      admissionRatePerMin?: number;
      nextPollAfterMs?: number;
    }>({ method: "GET", url: `queue-status/${encodeURIComponent(eventId)}` });
    assertOk(res);
    return {
      admissionRatePerMin: res.data.admissionRatePerMin,
      nextPollAfterMs: res.data.nextPollAfterMs,
    };
  }

  async claim(queueId: string, eventId: string): Promise<string> {
    const res = await this.http.request({
      method: "POST",
      url: `queue-entries/${encodeURIComponent(queueId)}/claim?eventId=${encodeURIComponent(eventId)}`,
    });
    return unwrap<{ admissionToken: string }>(res).admissionToken;
  }

  async heartbeat(eventId: string): Promise<number | undefined> {
    const res = await this.http.request({
      method: "POST",
      url: `queue-entries/me/heartbeat?eventId=${encodeURIComponent(eventId)}`,
    });
    return unwrap<{ nextHeartbeatMs?: number }>(res).nextHeartbeatMs;
  }

  async leave(queueId: string, eventId?: string): Promise<void> {
    if (!eventId) throw new Error("Event ID is required to leave the queue");
    const res = await this.http.request({
      method: "DELETE",
      url: `queue-entries/${encodeURIComponent(queueId)}?eventId=${encodeURIComponent(eventId)}`,
    });
    assertOk(res);
  }

  private toEntry(data: QueueWire, eventId: string): QueueEntry {
    return {
      queueId: data.entryId,
      eventId,
      position: data.exactPosition ?? NaN,
      status:
        data.state === "STALE"
          ? "WAITING"
          : data.state === "ENDED" && data.reason === "CLAIM_WINDOW_EXPIRED"
            ? "MISSED"
            : data.state === "ENDED" && data.reason === "LEFT"
              ? "LEFT"
              : (data.state ?? data.status),
      zone: data.zone,
      serverTime: data.serverTime,
    };
  }
}
