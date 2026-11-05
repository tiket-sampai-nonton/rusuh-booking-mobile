/**
 * RBT-042 — ObserveQueue / LeaveQueue use cases (pure application). Verifies
 * each delegates to the injected QueueRepository port and returns its result,
 * using a hand-written fake port (no infrastructure, no framework).
 */
import { LeaveQueue } from "@application/queue/leave-queue.use-case";
import { ObserveQueue } from "@application/queue/observe-queue.use-case";
import { ObserveQueueStatus } from "@application/queue/observe-queue-status.use-case";
import type {
  QueueEntry,
  QueueRepository,
} from "@domain/repositories/queue.repository";

function makeEntry(over: Partial<QueueEntry> = {}): QueueEntry {
  return {
    queueId: "q-1",
    eventId: "evt-1",
    position: 3,
    status: "WAITING",
    nextPollAfterMs: 2000,
    ...over,
  };
}

class FakeQueueRepository implements QueueRepository {
  getStatusCalls: string[] = [];
  getQueueStatusCalls: string[] = [];
  leaveCalls: string[] = [];
  constructor(private readonly entry: QueueEntry) {}

  async join(eventId: string): Promise<QueueEntry> {
    return makeEntry({ eventId });
  }
  async getStatus(queueId: string): Promise<QueueEntry> {
    this.getStatusCalls.push(queueId);
    return this.entry;
  }
  async getQueueStatus(eventId: string): Promise<{ admissionRatePerMin?: number }> {
    this.getQueueStatusCalls.push(eventId);
    return { admissionRatePerMin: 900 };
  }
  async leave(queueId: string): Promise<void> {
    this.leaveCalls.push(queueId);
  }
}

describe("RBT-042 ObserveQueue", () => {
  it("calls port.getStatus with the queueId and returns the entry", async () => {
    const expected = makeEntry({ queueId: "q-42", position: 1 });
    const repo = new FakeQueueRepository(expected);

    const result = await new ObserveQueue(repo).execute("q-42");

    expect(repo.getStatusCalls).toEqual(["q-42"]);
    expect(result).toBe(expected);
  });

  it("makes exactly one getStatus call per execute (single-shot read)", async () => {
    const repo = new FakeQueueRepository(makeEntry());
    const observe = new ObserveQueue(repo);
    await observe.execute("q-1");
    await observe.execute("q-1");
    expect(repo.getStatusCalls).toHaveLength(2);
  });
});

describe("RBT-119 ObserveQueueStatus", () => {
  it("returns the server-provided public admission rate", async () => {
    const repo = new FakeQueueRepository(makeEntry());
    const result = await new ObserveQueueStatus(repo).execute("evt-9");
    expect(repo.getQueueStatusCalls).toEqual(["evt-9"]);
    expect(result).toEqual({ admissionRatePerMin: 900 });
  });
});

describe("RBT-042 LeaveQueue", () => {
  it("delegates to port.leave with the queueId", async () => {
    const repo = new FakeQueueRepository(makeEntry());
    await new LeaveQueue(repo).execute("q-7");
    expect(repo.leaveCalls).toEqual(["q-7"]);
  });
});
