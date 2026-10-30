import { ListEvents } from "@application/use-cases/list-events";
import type {
  EventDetail,
  EventRepository,
  EventSummary,
} from "@domain/repositories/event.repository";
import type { ClockPort } from "@domain/services/clock.port";
import { ServerClock } from "@domain/services/server-clock";

const NOW = Date.parse("2026-06-01T00:00:00.000Z");

class FixedClock implements ClockPort {
  constructor(private readonly ms: number) {}
  now(): number {
    return this.ms;
  }
}

function makeRepo(events: EventSummary[]): EventRepository {
  return {
    listEvents: async () => events,
    getEventDetail: async (id) => events.find((e) => e.id === id) as EventDetail,
  };
}

const base: EventSummary = {
  id: "x",
  slug: "x",
  name: "X",
  salesStartsAt: "2026-01-01T00:00:00.000Z",
  salesEndsAt: "2026-02-01T00:00:00.000Z",
  status: "AVAILABLE",
};

describe("ListEvents use case", () => {
  it("returns the catalog split on the server clock", async () => {
    const events: EventSummary[] = [
      { ...base, id: "soon", startsAt: "2026-07-01T00:00:00.000Z" },
      { ...base, id: "old", status: "CLOSED", startsAt: "2025-01-01T00:00:00.000Z" },
    ];
    const clock = new ServerClock(new FixedClock(NOW));
    const result = await new ListEvents(makeRepo(events), clock).execute();
    expect(result.upcoming.map((e) => e.id)).toEqual(["soon"]);
    expect(result.history.map((e) => e.id)).toEqual(["old"]);
  });

  it("handles an empty catalog", async () => {
    const clock = new ServerClock(new FixedClock(NOW));
    const result = await new ListEvents(makeRepo([]), clock).execute();
    expect(result).toEqual({ upcoming: [], history: [] });
  });

  it("propagates a repository error", async () => {
    const failing: EventRepository = {
      listEvents: async () => {
        throw new Error("boom");
      },
      getEventDetail: async () => {
        throw new Error("boom");
      },
    };
    const clock = new ServerClock(new FixedClock(NOW));
    await expect(new ListEvents(failing, clock).execute()).rejects.toThrow(
      "boom",
    );
  });
});
