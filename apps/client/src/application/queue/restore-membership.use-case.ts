/**
 * RestoreMembership — application use case (RBT-041, E5 Queue).
 *
 * The refresh-safe-persistence restore half: on app start, load any persisted
 * anonymous waiting-room membership (RBT-023 pattern) and decide whether to
 * RESUME it. The persisted membership is a pointer only — the live status is
 * re-fetched from the server through the frozen {@link QueueRepository} port and
 * classified by the RBT-040 state machine:
 *   - ACTIVE entry  (WAITING / ADMITTED / CLAIMED) → RESUME: return the
 *     membership + the fresh entry so the caller routes into the waiting room.
 *   - TERMINAL entry (MISSED / LEFT / SOLD_OUT / CLOSED / COMPLETED / ENDED) →
 *     CLEAR the stale membership and return null (nothing to resume).
 * A missing membership (fresh install / already cleared) → null, no fetch.
 *
 * If the status fetch FAILS (e.g. offline / the entry no longer exists on the
 * server), the membership is cleared and null returned — a dead pointer must
 * not trap the user on a broken waiting room across restarts.
 *
 * PURE TS: ports + the pure state machine only; no React / RN / Expo / TanStack
 * / infrastructure imports (ARCHITECTURE §3, §4.3).
 */
import type {
  QueueMembership,
  QueueMembershipStorage,
} from "@domain/queue/queue-membership.port";
import type {
  QueueEntry,
  QueueRepository,
} from "@domain/repositories/queue.repository";
import { isTerminal } from "@domain/state-machines/queue-state-machine";

/** A resumable membership plus its freshly-fetched entry. */
export interface ResumedMembership {
  readonly membership: QueueMembership;
  readonly entry: QueueEntry;
}

export class RestoreMembership {
  constructor(
    private readonly queue: QueueRepository,
    private readonly membership: QueueMembershipStorage,
  ) {}

  /**
   * Resolve to the resumable membership (ACTIVE) or null (none persisted, or
   * terminal/unresolvable → cleared).
   */
  async execute(): Promise<ResumedMembership | null> {
    const stored = await this.membership.load();
    if (stored === null) return null;

    let entry: QueueEntry;
    try {
      entry = await this.queue.getStatus(stored.queueId, stored.eventId);
    } catch (error) {
      const status = (error as { httpStatus?: number } | null)?.httpStatus;
      if (status === 404 || status === 410) await this.membership.clear();
      return null;
    }

    if (isTerminal(entry.status)) {
      await this.membership.clear();
      return null;
    }

    return { membership: stored, entry };
  }
}
