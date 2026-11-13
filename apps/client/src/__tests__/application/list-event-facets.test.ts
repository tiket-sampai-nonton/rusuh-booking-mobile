import { ListEventFacets } from "@application/events/list-event-facets.use-case";
import type { EventRepository } from "@domain/repositories/event.repository";
import { ServerClock } from "@domain/services/server-clock";

describe("ListEventFacets", () => {
  it("requests options for the other active filters without the current genre or sort", async () => {
    const getFacets = jest
      .fn()
      .mockResolvedValue({ cities: ["Bandung"], genres: ["JAZZ", "ROCK"] });
    const repo: EventRepository = {
      listEvents: jest.fn(),
      getEventDetail: jest.fn(),
      getFacets,
    };
    const usecase = new ListEventFacets(
      repo,
      new ServerClock({ now: () => 0 }),
    );
    await expect(
      usecase.execute({
        genres: ["JAZZ"],
        city: "Bandung",
        timeframe: "THIS_WEEK",
        sort: "DATE_DESC",
      }),
    ).resolves.toEqual({ cities: ["Bandung"], genres: ["JAZZ", "ROCK"] });
    expect(getFacets).toHaveBeenCalledWith({
      city: "Bandung",
      timeframe: "THIS_WEEK",
    });
  });

  it("syncs server time before requesting the three-month WIB range", async () => {
    const clock = new ServerClock({
      now: () => Date.parse("2030-01-01T00:00:00Z"),
    });
    const getFacets = jest
      .fn()
      .mockResolvedValue({ cities: [], genres: ["JAZZ"] });
    const listEvents = jest.fn().mockImplementation(async () => {
      clock.sync("2026-01-31T18:00:00Z");
      return [];
    });
    const repo: EventRepository = {
      supportsServerFilters: true,
      listEvents,
      getEventDetail: jest.fn(),
      getFacets,
    };
    await new ListEventFacets(repo, clock).execute({}, true);
    expect(getFacets).toHaveBeenCalledWith({
      startDate: "2026-02-01",
      endDate: "2026-05-01",
    });
  });

  it("requires synchronized server time before building a quarter filter", async () => {
    const repo: EventRepository = {
      supportsServerFilters: true,
      listEvents: jest.fn().mockResolvedValue([]),
      getEventDetail: jest.fn(),
      getFacets: jest.fn(),
    };
    await expect(
      new ListEventFacets(repo, new ServerClock({ now: () => 0 })).execute(
        {},
        true,
      ),
    ).rejects.toThrow("Waktu server belum tersedia");
  });

  it("fails clearly when server filters are supported but facets are missing", async () => {
    const repo: EventRepository = {
      supportsServerFilters: true,
      listEvents: jest.fn(),
      getEventDetail: jest.fn(),
    };
    await expect(
      new ListEventFacets(repo, new ServerClock({ now: () => 0 })).execute({}),
    ).rejects.toThrow("Pilihan genre belum tersedia");
  });

  it("propagates a facets failure for retry instead of inventing genres", async () => {
    const repo: EventRepository = {
      listEvents: jest.fn(),
      getEventDetail: jest.fn(),
      getFacets: jest.fn().mockRejectedValue(new Error("offline")),
    };
    await expect(
      new ListEventFacets(repo, new ServerClock({ now: () => 0 })).execute({}),
    ).rejects.toThrow("offline");
  });
});
