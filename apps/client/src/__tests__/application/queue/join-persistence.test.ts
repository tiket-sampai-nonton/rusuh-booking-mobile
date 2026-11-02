/**
 * RBT-041 — JoinQueue + RestoreMembership application use cases.
 *
 * Pure-TS tests against a fake QueueRepository + the InMemoryQueueMembership
 * fixture (no React/RN/Expo). They assert:
 *   - JoinQueue joins via the port AND persists the issued membership;
 *   - a failed join persists NOTHING;
 *   - RestoreMembership resumes an ACTIVE entry (re-fetched live status),
 *     clears + returns null for a TERMINAL entry, returns null (no fetch) when
 *     nothing is persisted, and clears a dead pointer when the status fetch
 *     throws.
 */
import { JoinQueue } from "@application/queue/join-queue.use-case";
import { RestoreMembership } from "@application/queue/restore-membership.use-case";
import type { QueueMembershipStorage } from "@domain/queue/queue-membership.port";
import type {
  QueueEntry,
  QueueRepository,
  QueueStatus,
} from "@domain/repositories/queue.repository";
import { InMemoryQueueMembership } from "@infrastructure/__fixtures__/in-memory-queue-membership";

function entry(overrides: Partial<QueueEntry> = {}): QueueEntry {
  return {
    queueId: "q-evt-1",
    eventId: "evt-1",
    position: 5,
    status: "WAITING",
    ...overrides,
  };
}

class FakeQueueRepository implements QueueRepository {
  public joinCalls: string[] = [];
  public getStatusCalls: string[] = [];
  public joinError: Error | null = null;
  public getStatusError: Error | null = null;
  public statusToReturn: QueueStatus = "WAITING";

  async join(eventId: string): Promise<QueueEntry> {
    this.joinCalls.push(eventId);
    if (this.joinError) throw this.joinError;
    return entry({ eventId, queueId: `q-${eventId}` });
  }
  async getStatus(queueId: string): Promise<QueueEntry> {
    this.getStatusCalls.push(queueId);
    if (this.getStatusError) throw this.getStatusError;
    return entry({ queueId, status: this.statusToReturn });
  }
  async leave(_queueId: string): Promise<void> {
    void _queueId;
  }
}

describe("RBT-041 JoinQueue", () => {
  let repo: FakeQueueRepository;
  let storage: QueueMembershipStorage;
  beforeEach(() => {
    repo = new FakeQueueRepository();
    storage = new InMemoryQueueMembership();
  });

  it("joins anonymously via the port and returns the issued entry", async () => {
    const result = await new JoinQueue(repo, storage).execute("evt-9");
    expect(repo.joinCalls).toEqual(["evt-9"]);
    expect(result.eventId).toBe("evt-9");
    expect(result.queueId).toBe("q-evt-9");
  });

  it("persists the issued membership (eventId + queueId)", async () => {
    await new JoinQueue(repo, storage).execute("evt-9");
    expect(await storage.load()).toEqual({
      eventId: "evt-9",
      queueId: "q-evt-9",
    });
  });

  it("persists NOTHING when the join fails", async () => {
    repo.joinError = new Error("join rejected");
    await expect(new JoinQueue(repo, storage).execute("evt-9")).rejects.toThrow(
      "join rejected",
    );
    expect(await storage.load()).toBeNull();
  });
});

describe("RBT-041 RestoreMembership", () => {
  let repo: FakeQueueRepository;
  let storage: QueueMembershipStorage;
  beforeEach(() => {
    repo = new FakeQueueRepository();
    storage = new InMemoryQueueMembership();
  });

  it("returns null and does NOT fetch when no membership is persisted", async () => {
    const resumed = await new RestoreMembership(repo, storage).execute();
    expect(resumed).toBeNull();
    expect(repo.getStatusCalls).toEqual([]);
  });

  it.each<QueueStatus>(["WAITING", "ADMITTED", "CLAIMED"])(
    "resumes an ACTIVE entry (%s) with a freshly-fetched status",
    async (status) => {
      await storage.save({ eventId: "evt-1", queueId: "q-evt-1" });
      repo.statusToReturn = status;
      const resumed = await new RestoreMembership(repo, storage).execute();
      expect(repo.getStatusCalls).toEqual(["q-evt-1"]);
      expect(resumed).not.toBeNull();
      expect(resumed?.membership).toEqual({ eventId: "evt-1", queueId: "q-evt-1" });
      expect(resumed?.entry.status).toBe(status);
      // Still persisted — an active slot is not cleared.
      expect(await storage.load()).not.toBeNull();
    },
  );

  it.each<QueueStatus>([
    "MISSED",
    "LEFT",
    "SOLD_OUT",
    "CLOSED",
    "COMPLETED",
    "ENDED",
  ])("clears a TERMINAL entry (%s) and returns null", async (status) => {
    await storage.save({ eventId: "evt-1", queueId: "q-evt-1" });
    repo.statusToReturn = status;
    const resumed = await new RestoreMembership(repo, storage).execute();
    expect(resumed).toBeNull();
    expect(await storage.load()).toBeNull();
  });

  it("clears a dead pointer and returns null when the status fetch throws", async () => {
    await storage.save({ eventId: "evt-1", queueId: "q-evt-1" });
    repo.getStatusError = new Error("offline / entry gone");
    const resumed = await new RestoreMembership(repo, storage).execute();
    expect(resumed).toBeNull();
    expect(await storage.load()).toBeNull();
  });
});
