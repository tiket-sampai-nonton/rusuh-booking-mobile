/**
 * InMemoryQueueMembership — adapter for `QueueMembershipStorage` (RBT-041).
 *
 * A process-lifetime, field-backed store mirroring RBT-023's
 * `InMemoryTokenStorage`. Used as the web/test binding: on web SecureStore is
 * unsupported, so the membership lives only in memory and does NOT survive a
 * page reload (documented tradeoff). Framework-free; no React / RN / Expo
 * imports. The secure-store adapter is swapped in on native at the composition
 * root.
 *
 * A defensive COPY is stored and returned so callers cannot mutate the held
 * record by reference.
 */
import type {
  QueueMembership,
  QueueMembershipStorage,
} from "@domain/queue/queue-membership.port";

export class InMemoryQueueMembership implements QueueMembershipStorage {
  private membership: QueueMembership | null = null;

  async save(membership: QueueMembership): Promise<void> {
    this.membership = { eventId: membership.eventId, queueId: membership.queueId };
  }

  async load(): Promise<QueueMembership | null> {
    if (this.membership === null) return null;
    return { eventId: this.membership.eventId, queueId: this.membership.queueId };
  }

  async clear(): Promise<void> {
    this.membership = null;
  }
}
