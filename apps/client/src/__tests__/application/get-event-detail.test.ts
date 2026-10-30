import { GetEventDetail } from "@application/use-cases/get-event-detail";
import { JoinQueue } from "@application/use-cases/join-queue";
import type {
  EventDetail,
  EventRepository,
} from "@domain/repositories/event.repository";
import type {
  QueueEntry,
  QueueRepository,
} from "@domain/repositories/queue.repository";

const detail: EventDetail = {
  id: "evt-1",
  slug: "e",
  name: "E",
  salesStartsAt: "2026-01-01T00:00:00.000Z",
  salesEndsAt: "2026-02-01T00:00:00.000Z",
  status: "AVAILABLE",
  minPriceMinor: 45000000,
};

describe("GetEventDetail use case", () => {
  it("delegates to the repository", async () => {
    const repo: EventRepository = {
      listEvents: async () => [],
      getEventDetail: async (id) => ({ ...detail, id }),
    };
    const result = await new GetEventDetail(repo).execute("evt-9");
    expect(result.id).toBe("evt-9");
  });

  it("propagates a repository error", async () => {
    const repo: EventRepository = {
      listEvents: async () => [],
      getEventDetail: async () => {
        throw new Error("not found");
      },
    };
    await expect(new GetEventDetail(repo).execute("x")).rejects.toThrow(
      "not found",
    );
  });
});

describe("JoinQueue use case", () => {
  const entry: QueueEntry = {
    queueId: "q-evt-1",
    eventId: "evt-1",
    position: 5,
    status: "WAITING",
  };

  it("joins anonymously and returns the entry", async () => {
    const repo: QueueRepository = {
      join: async (eventId) => ({ ...entry, eventId }),
      getStatus: async () => entry,
      leave: async () => {},
    };
    const result = await new JoinQueue(repo).execute("evt-1");
    expect(result.queueId).toBe("q-evt-1");
    expect(result.status).toBe("WAITING");
  });

  it("propagates a join error", async () => {
    const repo: QueueRepository = {
      join: async () => {
        throw new Error("sold out");
      },
      getStatus: async () => entry,
      leave: async () => {},
    };
    await expect(new JoinQueue(repo).execute("evt-1")).rejects.toThrow(
      "sold out",
    );
  });
});
