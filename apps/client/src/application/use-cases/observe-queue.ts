/**
 * ObserveQueue + LeaveQueue use cases (application layer — framework-free).
 *
 * ObserveQueue reads the latest `QueueEntry` for a previously-issued queue id
 * (the waiting-room poll). LeaveQueue abandons the slot. Neither names a
 * framework; the waiting-room hook orchestrates the polling cadence.
 */
import type {
  QueueEntry,
  QueueRepository,
} from "@domain/repositories/queue.repository";

export class ObserveQueue {
  constructor(private readonly queue: QueueRepository) {}

  execute(queueId: string): Promise<QueueEntry> {
    return this.queue.getStatus(queueId);
  }
}

export class LeaveQueue {
  constructor(private readonly queue: QueueRepository) {}

  execute(queueId: string): Promise<void> {
    return this.queue.leave(queueId);
  }
}
