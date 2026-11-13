import { ListEvents } from "@application/events/list-events.use-case";
import type {
  EventDetail,
  EventRepository,
  EventSummary,
} from "@domain/repositories/event.repository";
import type { ClockPort } from "@domain/services/clock.port";
import { ServerClock } from "@domain/services/server-clock";
import { catalogQuarter } from "@domain/rules/catalog-quarter";

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
    getEventDetail: async (id) =>
      events.find((e) => e.id === id) as EventDetail,
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
  it("calculates inclusive WIB quarter dates with calendar month clamping", () => {
    expect(catalogQuarter(Date.parse("2026-01-31T18:00:00Z"))).toEqual({
      startDate: "2026-02-01",
      endDate: "2026-05-01",
    });
    expect(catalogQuarter(Date.parse("2026-01-31T00:00:00Z"))).toEqual({
      startDate: "2026-01-31",
      endDate: "2026-04-30",
    });
  });

  it("syncs before calculating quarter dates and preserves server order", async () => {
    const clock = new ServerClock(
      new FixedClock(Date.parse("2030-01-01T00:00:00Z")),
    );
    const events = [
      { ...base, id: "later", startsAt: "2026-03-01T00:00:00Z" },
      { ...base, id: "earlier", startsAt: "2026-02-01T00:00:00Z" },
    ];
    const listEvents = jest.fn().mockImplementation(async () => {
      clock.sync("2026-01-31T18:00:00Z");
      return events;
    });
    const repo: EventRepository = {
      ...makeRepo(events),
      supportsServerFilters: true,
      listEvents,
    };
    const result = await new ListEvents(repo, clock).execute(
      { sort: "DATE_DESC" },
      true,
    );
    expect(listEvents).toHaveBeenNthCalledWith(1, { timeframe: "ALL" });
    expect(listEvents).toHaveBeenNthCalledWith(2, {
      sort: "DATE_DESC",
      startDate: "2026-02-01",
      endDate: "2026-05-01",
    });
    expect(result.upcoming.map((event) => event.id)).toEqual([
      "later",
      "earlier",
    ]);
  });

  it("does not calculate quarter dates when server time is unavailable", async () => {
    const clock = new ServerClock(new FixedClock(NOW));
    const repo: EventRepository = {
      ...makeRepo([]),
      supportsServerFilters: true,
    };
    await expect(new ListEvents(repo, clock).execute({}, true)).rejects.toThrow(
      "Waktu server",
    );
  });
  it("returns the catalog split on the server clock", async () => {
    const events: EventSummary[] = [
      { ...base, id: "soon", startsAt: "2026-07-01T00:00:00.000Z" },
      {
        ...base,
        id: "old",
        status: "CLOSED",
        startsAt: "2025-01-01T00:00:00.000Z",
      },
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
