/**
 * Browse filter logic — pure-function unit tests (RBT-031).
 *
 * The URL-driven filter/sort over EventSummary[] is a pure module (no React /
 * expo). Every genre, every time window, every sort order, combined filters,
 * the empty-result case, and URL-param normalization (user-controlled input)
 * are verified directly here — the component test only proves URL↔UI sync.
 */
import type { EventSummary } from "@domain/repositories/event.repository";
import {
  GENRES,
  SORTS,
  TIMES,
  filterEvents,
  inTimeBucket,
  isFiltered,
  matchesCategory,
  readGenre,
  readParam,
} from "@presentation/screens/Browse/filter";

const DAY = 86_400_000;
const NOW = Date.parse("2026-11-01T00:00:00.000Z");

/** Build a minimal EventSummary with an offset-from-now start. */
function ev(id: string, name: string, daysFromNow: number): EventSummary {
  return {
    id,
    slug: id,
    name,
    salesStartsAt: new Date(NOW).toISOString(),
    salesEndsAt: new Date(NOW + 365 * DAY).toISOString(),
    status: "AVAILABLE",
    startsAt: new Date(NOW + daysFromNow * DAY).toISOString(),
    remainingTickets: 300,
  };
}

const CATALOG: readonly EventSummary[] = [
  ev("a", "Rock Fest Jakarta", 3), // this week
  ev("b", "Jazz in the Park", 20), // this month
  ev("c", "Elektronik Waves", 60), // this quarter
  ev("d", "Folk Night", 120), // beyond quarter
  ev("e", "Orkestra Gala", 2), // this week
];

describe("readParam", () => {
  it("returns the value when it is in the valid set", () => {
    expect(readParam("week", TIMES, "all")).toBe("week");
  });

  it("falls back for an unknown / tampered value", () => {
    expect(readParam("hacked", TIMES, "all")).toBe("all");
  });

  it("falls back for undefined", () => {
    expect(readParam(undefined, SORTS, "closest")).toBe("closest");
  });

  it("reads the first element of an array param", () => {
    expect(readParam(["month", "week"], TIMES, "all")).toBe("month");
  });
});

describe("readGenre (case-insensitive, user-controlled URL)", () => {
  it("accepts the canonical capitalized genre", () => {
    expect(readGenre("Rock")).toBe("Rock");
  });

  it("normalizes a lowercase URL genre to the canonical form", () => {
    // Home navigates /browse?genre=rock — the screen must still filter Rock.
    expect(readGenre("rock")).toBe("Rock");
    expect(readGenre("elektronik")).toBe("Elektronik");
  });

  it("falls back to 'Semua' for an unknown genre", () => {
    expect(readGenre("polka")).toBe("Semua");
  });

  it("falls back to 'Semua' for undefined", () => {
    expect(readGenre(undefined)).toBe("Semua");
  });

  it("reads the first element of an array param", () => {
    expect(readGenre(["jazz", "rock"])).toBe("Jazz");
  });
});

describe("inTimeBucket", () => {
  it("passes everything for 'all'", () => {
    expect(inTimeBucket(ev("x", "X", 400), "all", NOW)).toBe(true);
  });

  it("keeps only events within 7 days for 'week'", () => {
    expect(inTimeBucket(ev("x", "X", 3), "week", NOW)).toBe(true);
    expect(inTimeBucket(ev("x", "X", 20), "week", NOW)).toBe(false);
  });

  it("keeps only events within 30 days for 'month'", () => {
    expect(inTimeBucket(ev("x", "X", 20), "month", NOW)).toBe(true);
    expect(inTimeBucket(ev("x", "X", 60), "month", NOW)).toBe(false);
  });

  it("keeps only events within 90 days for 'quarter'", () => {
    expect(inTimeBucket(ev("x", "X", 60), "quarter", NOW)).toBe(true);
    expect(inTimeBucket(ev("x", "X", 120), "quarter", NOW)).toBe(false);
  });

  it("excludes past events from a time bucket", () => {
    expect(inTimeBucket(ev("x", "X", -5), "week", NOW)).toBe(false);
  });

  it("returns false for an event without a parseable start in a bucket", () => {
    const noStart = { ...ev("x", "X", 3), startsAt: undefined };
    expect(inTimeBucket(noStart, "week", NOW)).toBe(false);
  });
});

describe("filterEvents — genre", () => {
  it.each([
    ["Rock", ["a"]],
    ["Jazz", ["b"]],
    ["Elektronik", ["c"]],
    ["Folk", ["d"]],
    ["Orkestra", ["e"]],
  ])("filters by genre %s", (genre, expectedIds) => {
    const out = filterEvents(CATALOG, genre, "all", "closest", NOW);
    expect(out.map((e) => e.id)).toEqual(expectedIds);
  });

  it("returns everything for 'Semua'", () => {
    const out = filterEvents(CATALOG, "Semua", "all", "closest", NOW);
    expect(out).toHaveLength(CATALOG.length);
  });
});

describe("matchesCategory", () => {
  it("matches common category aliases in event names", () => {
    expect(matchesCategory(CATALOG[0], "festival")).toBe(true);
    expect(matchesCategory(ev("concert", "Jakarta Konser", 1), "concert")).toBe(true);
  });

  it("does not match unrelated categories", () => {
    expect(matchesCategory(CATALOG[0], "theater")).toBe(false);
  });
});

describe("filterEvents — time windows", () => {
  it("week keeps only the two soonest", () => {
    const out = filterEvents(CATALOG, "Semua", "week", "closest", NOW);
    expect(out.map((e) => e.id).sort()).toEqual(["a", "e"]);
  });

  it("month keeps week + month events", () => {
    const out = filterEvents(CATALOG, "Semua", "month", "closest", NOW);
    expect(out.map((e) => e.id).sort()).toEqual(["a", "b", "e"]);
  });

  it("quarter keeps everything within 90 days", () => {
    const out = filterEvents(CATALOG, "Semua", "quarter", "closest", NOW);
    expect(out.map((e) => e.id).sort()).toEqual(["a", "b", "c", "e"]);
  });
});

describe("filterEvents — sort", () => {
  it("closest sorts ascending by start", () => {
    const out = filterEvents(CATALOG, "Semua", "all", "closest", NOW);
    expect(out.map((e) => e.id)).toEqual(["e", "a", "b", "c", "d"]);
  });

  it("furthest sorts descending by start", () => {
    const out = filterEvents(CATALOG, "Semua", "all", "furthest", NOW);
    expect(out.map((e) => e.id)).toEqual(["d", "c", "b", "a", "e"]);
  });

  it("does not mutate the input array", () => {
    const copy = [...CATALOG];
    filterEvents(CATALOG, "Semua", "all", "furthest", NOW);
    expect(CATALOG).toEqual(copy);
  });
});

describe("filterEvents — combined + empty", () => {
  it("combines genre + time + sort", () => {
    const out = filterEvents(CATALOG, "Rock", "week", "closest", NOW);
    expect(out.map((e) => e.id)).toEqual(["a"]);
  });

  it("returns an empty list when nothing matches", () => {
    const out = filterEvents(CATALOG, "Jazz", "week", "closest", NOW);
    expect(out).toEqual([]);
  });

  it("returns an empty list for an empty catalog", () => {
    expect(filterEvents([], "Semua", "all", "closest", NOW)).toEqual([]);
  });
});

describe("isFiltered", () => {
  it("is false for the default view", () => {
    expect(isFiltered("Semua", "all", "closest")).toBe(false);
  });

  it("is true when any dimension is non-default", () => {
    expect(isFiltered("Rock", "all", "closest")).toBe(true);
    expect(isFiltered("Semua", "week", "closest")).toBe(true);
    expect(isFiltered("Semua", "all", "furthest")).toBe(true);
  });
});

describe("constants", () => {
  it("exposes the prototype genres (Semua first)", () => {
    expect(GENRES[0]).toBe("Semua");
    expect(GENRES).toContain("Rock");
    expect(GENRES).toContain("Orkestra");
  });
});
