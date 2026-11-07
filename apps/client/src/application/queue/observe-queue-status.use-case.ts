import type {
  QueueRepository,
  QueueStatusSnapshot,
} from "@domain/repositories/queue.repository";

/** Reads public event-level queue configuration through the queue port. */
export class ObserveQueueStatus {
  constructor(private readonly queue: QueueRepository) {}

  execute(eventId: string): Promise<QueueStatusSnapshot> {
    return this.queue.getQueueStatus(eventId);
  }
}
