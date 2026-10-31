/**
 * Browse filter pure logic (screens/Browse/filter.ts) — framework-free.
 *
 * Exercises the time-bucket windows (week/month/quarter), the non-finite-date
 * guard, the genre name-match (O1 gap), the closest/furthest sort, the URL
 * param normalization, and isFiltered — with real assertions.
 */
import type { EventSummary } from "@domain/repositories/event.repository";
import {
  filterEvents,
  inTimeBucket,
  isFiltered,
  readParam,
  SORTS,
  TIMES,
} from "@presentation/screens/Browse/filter";

const NOW = Date.UTC(2026, 0, 1); // fixed "now" for deterministic windows
const DAY = 86_400_000;

function ev(id: string, name: string, daysFromNow: number | null): EventSummary {
  return {
    id,
    name,
    venue: "Venue",
    startsAt: daysFromNow === null ? undefined : new Date(NOW + daysFromNow * DAY).toISOString(),
  } as EventSummary;
}

describe("readParam", () => {
  it("returns the value when valid", () => {
    expect(readParam("week", TIMES, "all")).toBe("week");
  });
  it("falls back for an unknown value", () => {
    expect(readParam("bogus", TIMES, "all")).toBe("all");
  });
  it("falls back for undefined", () => {
    expect(readParam(undefined, SORTS, "closest")).toBe("closest");
  });
  it("takes the first element of an array param", () => {
    expect(readParam(["furthest", "closest"], SORTS, "closest")).toBe("furthest");
  });
});

describe("inTimeBucket", () => {
  const e = ev("e1", "Fest", 3); // 3 days out

  it("'all' always matches", () => {
    expect(inTimeBucket(e, "all", NOW)).toBe(true);
  });
  it("matches inside the week window, misses outside it", () => {
    expect(inTimeBucket(ev("a", "A", 3), "week", NOW)).toBe(true);
    expect(inTimeBucket(ev("b", "B", 20), "week", NOW)).toBe(false);
  });
  it("matches inside the month window", () => {
    expect(inTimeBucket(ev("c", "C", 20), "month", NOW)).toBe(true);
    expect(inTimeBucket(ev("d", "D", 60), "month", NOW)).toBe(false);
  });
  it("matches inside the quarter window", () => {
    expect(inTimeBucket(ev("f", "F", 60), "quarter", NOW)).toBe(true);
    expect(inTimeBucket(ev("g", "G", 200), "quarter", NOW)).toBe(false);
  });
  it("rejects a non-finite (missing) date for a dated bucket", () => {
    expect(inTimeBucket(ev("h", "H", null), "week", NOW)).toBe(false);
  });
});

describe("filterEvents", () => {
  const all = [ev("a", "Jazz Night", 10), ev("b", "Rock Fest", 2), ev("c", "Folk Day", 40)];

  it("sorts closest-first by default", () => {
    const out = filterEvents(all, "Semua", "all", "closest", NOW);
    expect(out.map((x) => x.id)).toEqual(["b", "a", "c"]);
  });
  it("sorts furthest-first when requested", () => {
    const out = filterEvents(all, "Semua", "all", "furthest", NOW);
    expect(out.map((x) => x.id)).toEqual(["c", "a", "b"]);
  });
  it("genre does a best-effort name match (O1 gap)", () => {
    const out = filterEvents(all, "Jazz", "all", "closest", NOW);
    expect(out.map((x) => x.id)).toEqual(["a"]);
  });
  it("combines a time window with the sort", () => {
    const out = filterEvents(all, "Semua", "month", "closest", NOW);
    expect(out.map((x) => x.id)).toEqual(["b", "a"]); // c (40d) is outside month
  });
});

describe("isFiltered", () => {
  it("is false for the default (all-defaults) query", () => {
    expect(isFiltered("Semua", "all", "closest")).toBe(false);
  });
  it("is true when any dimension is non-default", () => {
    expect(isFiltered("Jazz", "all", "closest")).toBe(true);
    expect(isFiltered("Semua", "week", "closest")).toBe(true);
    expect(isFiltered("Semua", "all", "furthest")).toBe(true);
  });
});
