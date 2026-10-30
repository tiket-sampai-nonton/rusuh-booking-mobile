/**
 * MockQueueRepository — in-memory adapter for `QueueRepository`.
 *
 * Bound by the composition root under `EXPO_PUBLIC_USE_MOCKS`. Framework-free;
 * deterministic. The position decrements on each `getStatus` so a waiting-room
 * demo visibly progresses without a backend.
 */
import type {
  QueueRepository,
  QueueTicket,
} from "@domain/repositories/queue.repository";

export class MockQueueRepository implements QueueRepository {
  private readonly positions = new Map<string, number>();

  async join(eventId: string): Promise<QueueTicket> {
    const queueId = `q-${eventId}`;
    this.positions.set(queueId, 5);
    return { queueId, position: 5 };
  }

  async getStatus(queueId: string): Promise<QueueTicket> {
    const current = this.positions.get(queueId) ?? 0;
    const next = current > 0 ? current - 1 : 0;
    this.positions.set(queueId, next);
    return { queueId, position: next };
  }

  async leave(queueId: string): Promise<void> {
    this.positions.delete(queueId);
  }
}
