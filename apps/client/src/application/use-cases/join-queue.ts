/**
 * JoinQueue use case (application layer — framework-free).
 *
 * Anonymous waiting-room join (D8.4, D8.5 — no login, buyer NIK/email collected
 * later at checkout). Returns the issued `QueueEntry`; the caller (waiting-room
 * hook) persists `queueId` so a refresh restores the slot (RBT-041 territory;
 * here we only issue the entry). The join is non-idempotent per the contract —
 * the BE reconciles a re-join to the existing slot (BR-07).
 */
import type {
  QueueEntry,
  QueueRepository,
} from "@domain/repositories/queue.repository";

export class JoinQueue {
  constructor(private readonly queue: QueueRepository) {}

  execute(eventId: string): Promise<QueueEntry> {
    return this.queue.join(eventId);
  }
}
