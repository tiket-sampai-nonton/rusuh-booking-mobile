/**
 * nearbyEvents — pure "Konser Terdekat" derivation (RBT-034).
 *
 * Exhaustive over the empty / all-past / all-future / mixed catalog, the
 * window boundaries (this week / this month / all), and the result limit — all
 * against a FIXED serverNow so the derivation is deterministic (never the
 * device clock). It reuses splitCatalog (upcoming asc), so the soonest event
 * always leads and past/CLOSED events are never "nearby".
 */
import type { EventSummary } from "@domain/repositories/event.repository";
import { nearbyEvents } from "@domain/rules/event-display";

const base: EventSummary = {
  id: "x",
  slug: "x",
  name: "X",
  salesStartsAt: "2026-01-01T00:00:00.000Z",
  salesEndsAt: "2026-02-01T00:00:00.000Z",
  status: "AVAILABLE",
};

const DAY = 86_400_000;
const NOW = Date.parse("2026-06-01T00:00:00.000Z");

/** Build an event that starts `days` from NOW. */
function at(
  id: string,
  days: number,
  extra: Partial<EventSummary> = {},
): EventSummary {
  return {
    ...base,
    id,
    startsAt: new Date(NOW + days * DAY).toISOString(),
    ...extra,
  };
}

describe("nearbyEvents", () => {
  it("returns [] for an empty catalog", () => {
    expect(nearbyEvents([], NOW)).toEqual([]);
  });

  it("returns [] when every event is in the past", () => {
    const events = [
      at("p1", -10, { status: "CLOSED" }),
      at("p2", -1),
      at("p3", -200, { status: "CLOSED" }),
    ];
    expect(nearbyEvents(events, NOW)).toEqual([]);
  });

  it("returns all upcoming (soonest first) when every event is future", () => {
    const events = [at("c", 30), at("a", 2), at("b", 10)];
    expect(nearbyEvents(events, NOW).map((e) => e.id)).toEqual(["a", "b", "c"]);
  });

  it("drops past/CLOSED events from a mixed catalog, keeping upcoming asc", () => {
    const events = [
      at("old", -5, { status: "CLOSED" }),
      at("far", 60),
      at("soon", 3),
      at("past", -1),
      at("mid", 20),
    ];
    expect(nearbyEvents(events, NOW).map((e) => e.id)).toEqual([
      "soon",
      "mid",
      "far",
    ]);
  });

  describe("time window", () => {
    const events = [
      at("inWeek", 3),
      at("weekEdge", 7),
      at("inMonth", 20),
      at("monthEdge", 30),
      at("far", 60),
    ];

    it("'all' (default) keeps every upcoming event", () => {
      expect(nearbyEvents(events, NOW).map((e) => e.id)).toEqual([
        "inWeek",
        "weekEdge",
        "inMonth",
        "monthEdge",
        "far",
      ]);
    });

    it("'week' keeps only events within 7 days (inclusive boundary)", () => {
      expect(
        nearbyEvents(events, NOW, { window: "week" }).map((e) => e.id),
      ).toEqual(["inWeek", "weekEdge"]);
    });

    it("'month' keeps only events within 30 days (inclusive boundary)", () => {
      expect(
        nearbyEvents(events, NOW, { window: "month" }).map((e) => e.id),
      ).toEqual(["inWeek", "weekEdge", "inMonth", "monthEdge"]);
    });

    it("window boundary is inclusive to the millisecond", () => {
      const exactly7 = [at("edge", 7)];
      expect(nearbyEvents(exactly7, NOW, { window: "week" })).toHaveLength(1);
      // one ms past the window → excluded
      const justOver = [
        {
          ...base,
          id: "over",
          startsAt: new Date(NOW + 7 * DAY + 1).toISOString(),
        },
      ];
      expect(nearbyEvents(justOver, NOW, { window: "week" })).toHaveLength(0);
    });
  });

  describe("limit", () => {
    const events = [at("a", 1), at("b", 2), at("c", 3), at("d", 4)];

    it("caps the result to the soonest N when limit is set", () => {
      expect(nearbyEvents(events, NOW, { limit: 2 }).map((e) => e.id)).toEqual([
        "a",
        "b",
      ]);
    });

    it("a limit larger than the set returns everything", () => {
      expect(nearbyEvents(events, NOW, { limit: 99 })).toHaveLength(4);
    });

    it("window and limit compose (filter by window, then cap)", () => {
      const mixed = [at("a", 1), at("b", 5), at("c", 20), at("d", 25)];
      const r = nearbyEvents(mixed, NOW, { window: "week", limit: 1 });
      expect(r.map((e) => e.id)).toEqual(["a"]);
    });
  });

  it("an upcoming event with no start date still appears (not filtered by window)", () => {
    const events = [
      { ...base, id: "nodate", startsAt: undefined },
      at("soon", 2),
    ];
    // dateless sorts to the front via splitCatalog; window math skips it.
    const r = nearbyEvents(events, NOW, { window: "week" });
    expect(r.map((e) => e.id)).toContain("nodate");
    expect(r.map((e) => e.id)).toContain("soon");
  });
});
