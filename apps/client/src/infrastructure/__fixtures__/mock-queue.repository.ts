/**
 * MockQueueRepository — in-memory adapter for `QueueRepository`.
 *
 * Bound by the composition root under `EXPO_PUBLIC_USE_MOCKS`. Framework-free;
 * deterministic. The position decrements on each `getStatus` so a waiting-room
 * demo visibly progresses without a backend.
 */
import type {
  QueueEntry,
  QueueRepository,
  QueueStatusSnapshot,
} from "@domain/repositories/queue.repository";

const MOCK_ADMISSION_RATE_PER_MIN = 1400;

export class MockQueueRepository implements QueueRepository {
  private readonly positions = new Map<string, number>();
  private readonly events = new Map<string, string>();

  private entry(queueId: string, position: number): QueueEntry {
    return {
      queueId,
      eventId: this.events.get(queueId) ?? "evt-1",
      position,
      status: position > 0 ? "WAITING" : "ADMITTED",
      zone: position <= 3 ? "GUARANTEED" : "POSSIBLE",
      nextPollAfterMs: 2000,
      serverTime: new Date().toISOString(),
    };
  }

  async join(eventId: string): Promise<QueueEntry> {
    const queueId = `q-${eventId}`;
    this.positions.set(queueId, 5);
    this.events.set(queueId, eventId);
    return this.entry(queueId, 5);
  }

  async getStatus(queueId: string): Promise<QueueEntry> {
    const current = this.positions.get(queueId) ?? 0;
    const next = current > 0 ? current - 1 : 0;
    this.positions.set(queueId, next);
    return this.entry(queueId, next);
  }

  async getQueueStatus(_eventId: string): Promise<QueueStatusSnapshot> {
    return { admissionRatePerMin: MOCK_ADMISSION_RATE_PER_MIN };
  }

  async leave(queueId: string): Promise<void> {
    this.positions.delete(queueId);
    this.events.delete(queueId);
  }

  async claim(_queueId: string, eventId: string): Promise<string> {
    return `mock-admission:${eventId}`;
  }

  async heartbeat(_eventId: string): Promise<number | undefined> {
    return undefined;
  }
}
