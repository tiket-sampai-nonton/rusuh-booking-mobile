/**
 * LeaveQueue — application use case (RBT-042, E5 Queue).
 *
 * Abandons a waiting-room entry through the frozen {@link QueueRepository}
 * port. PURE TS: port injected by constructor, imports domain only (no React /
 * RN / Expo / TanStack / infrastructure). Paired with {@link ObserveQueue} so
 * the polling hook can both read status and stop + leave through the same port
 * (ARCHITECTURE §3, §4.3).
 */
import type { QueueRepository } from "@domain/repositories/queue.repository";

export class LeaveQueue {
  constructor(private readonly queue: QueueRepository) {}

  /** Leave the waiting room for `queueId`. Resolves when the leave is accepted. */
  async execute(queueId: string, eventId?: string): Promise<void> {
    if (eventId === undefined) await this.queue.leave(queueId);
    else await this.queue.leave(queueId, eventId);
  }
}
