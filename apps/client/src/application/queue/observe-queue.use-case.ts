/**
 * ObserveQueue — application use case (RBT-042, E5 Queue).
 *
 * Reads the latest {@link QueueEntry} for a previously-issued entry through the
 * frozen {@link QueueRepository} port. PURE TS: the port is injected by
 * constructor, it imports domain only (no React / RN / Expo / TanStack /
 * infrastructure). The presentation polling hook drives this on the adaptive
 * cadence; the use case itself is a single-shot read (one `getStatus` call) and
 * owns no timer — the "one poller per session" guarantee lives in the hook's
 * single TanStack query (ARCHITECTURE §3, §4.3, §9.2).
 */
import type {
  QueueEntry,
  QueueRepository,
} from "@domain/repositories/queue.repository";

export class ObserveQueue {
  constructor(private readonly queue: QueueRepository) {}

  /** Fetch the current status for `queueId`. Resolves with the latest entry. */
  async execute(queueId: string, eventId?: string): Promise<QueueEntry> {
    return eventId === undefined
      ? this.queue.getStatus(queueId)
      : this.queue.getStatus(queueId, eventId);
  }
}
