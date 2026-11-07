import type {
  QueueMembership,
  QueueMembershipStorage,
} from "@domain/queue/queue-membership.port";

/** Non-secret queue identifiers needed to restore the visitor's active entry. */
export class WebQueueMembership implements QueueMembershipStorage {
  private current: QueueMembership | null = null;
  private readonly key = "rusuh.queue.membership";
  async save(value: QueueMembership): Promise<void> {
    this.current = { ...value };
    try {
      globalThis.localStorage.setItem(this.key, JSON.stringify(value));
    } catch {
      /* Storage may be unavailable. */
    }
  }
  async load(): Promise<QueueMembership | null> {
    try {
      const raw = globalThis.localStorage.getItem(this.key);
      if (!raw) return this.current;
      const value = JSON.parse(raw) as Partial<QueueMembership>;
      return typeof value.eventId === "string" &&
        typeof value.queueId === "string"
        ? { eventId: value.eventId, queueId: value.queueId }
        : null;
    } catch {
      return this.current;
    }
  }
  async clear(): Promise<void> {
    this.current = null;
    try {
      globalThis.localStorage.removeItem(this.key);
    } catch {
      /* Storage may be unavailable. */
    }
  }
}
