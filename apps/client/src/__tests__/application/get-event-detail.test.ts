import { GetEventDetail } from "@application/events/get-event-detail.use-case";
import type {
  EventDetail,
  EventRepository,
} from "@domain/repositories/event.repository";

const detail: EventDetail = {
  id: "evt-1",
  slug: "e",
  name: "Rusuh Fest 2026",
  venue: "GBK Jakarta",
  startsAt: "2026-12-01T12:00:00.000Z",
  salesStartsAt: "2026-11-01T00:00:00.000Z",
  salesEndsAt: "2026-11-30T23:59:59.000Z",
  status: "AVAILABLE",
  minPriceMinor: 45000000,
  remainingTickets: 120,
  description: { longDesc: "Festival." },
};

function repo(overrides: Partial<EventRepository> = {}): EventRepository {
  return {
    listEvents: async () => [],
    getEventDetail: async () => detail,
    ...overrides,
  };
}

describe("GetEventDetail use case", () => {
  it("returns the event detail for a valid id", async () => {
    const result = await new GetEventDetail(repo()).execute("evt-1");
    expect(result).toEqual(detail);
  });

  it("passes the requested id through to the repository", async () => {
    const seen: string[] = [];
    const uc = new GetEventDetail(
      repo({
        getEventDetail: async (id) => {
          seen.push(id);
          return detail;
        },
      }),
    );
    await uc.execute("evt-9");
    expect(seen).toEqual(["evt-9"]);
  });

  it("rejects an empty event id without hitting the repository", async () => {
    let called = false;
    const uc = new GetEventDetail(
      repo({
        getEventDetail: async () => {
          called = true;
          return detail;
        },
      }),
    );
    await expect(uc.execute("")).rejects.toThrow(/id/i);
    expect(called).toBe(false);
  });

  it("propagates a not-found / repository error", async () => {
    const uc = new GetEventDetail(
      repo({
        getEventDetail: async () => {
          throw new Error("unknown event");
        },
      }),
    );
    await expect(uc.execute("nope")).rejects.toThrow("unknown event");
  });
});
