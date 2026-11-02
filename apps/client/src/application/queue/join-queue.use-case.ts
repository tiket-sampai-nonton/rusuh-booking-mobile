/**
 * JoinQueue — application use case (RBT-041, E5 Queue).
 *
 * Anonymous waiting-room join (D8.5 guest flow — NO login; buyer NIK/email is
 * collected later at checkout). Joins through the frozen {@link QueueRepository}
 * port, then PERSISTS the issued membership (`eventId` + `queueId`) via the
 * {@link QueueMembershipStorage} port so a refresh / restart can restore the
 * slot (the refresh-safe persistence half of the ticket).
 *
 * PURE TS: both ports are constructor-injected, imports are domain-only (no
 * React / RN / Expo / TanStack / infrastructure). The composition root binds
 * the concrete adapters (ARCHITECTURE §3, §4.3).
 */
import type { QueueMembershipStorage } from "@domain/queue/queue-membership.port";
import type {
  QueueEntry,
  QueueRepository,
} from "@domain/repositories/queue.repository";

export class JoinQueue {
  constructor(
    private readonly queue: QueueRepository,
    private readonly membership: QueueMembershipStorage,
  ) {}

  /**
   * Join the waiting room for `eventId` and persist the issued membership.
   * Resolves with the issued {@link QueueEntry}. The persist happens AFTER a
   * successful join so a failed join leaves no stale membership behind.
   */
  async execute(eventId: string): Promise<QueueEntry> {
    const entry = await this.queue.join(eventId);
    await this.membership.save({
      eventId: entry.eventId,
      queueId: entry.queueId,
    });
    return entry;
  }
}
