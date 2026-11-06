import type {
  EventStatus,
  EventSummary,
} from "@domain/repositories/event.repository";
import {
  badgeFor,
  isPastEvent,
  LOW_STOCK_THRESHOLD,
  splitCatalog,
} from "@domain/rules/event-display";

describe("badgeFor", () => {
  it("SOLD_OUT → disabled Sold Out", () => {
    expect(badgeFor({ status: "SOLD_OUT" })).toEqual({
      tone: "soldout",
      label: "Sold Out",
      disabled: true,
    });
  });

  it("CLOSED → disabled Selesai", () => {
    expect(badgeFor({ status: "CLOSED" })).toEqual({
      tone: "done",
      label: "Selesai",
      disabled: true,
    });
  });

  it("NOT_STARTED → Segera (enterable)", () => {
    expect(badgeFor({ status: "NOT_STARTED" }).label).toBe("Segera");
  });

  it("AVAILABLE with plenty of stock → Tersedia", () => {
    const b = badgeFor({ status: "AVAILABLE", remainingTickets: 500 });
    expect(b).toEqual({ tone: "ok", label: "Tersedia", disabled: false });
  });

  it("AVAILABLE below the low-stock threshold → Stok Menipis", () => {
    const b = badgeFor({
      status: "AVAILABLE",
      remainingTickets: LOW_STOCK_THRESHOLD - 1,
    });
    expect(b).toEqual({ tone: "low", label: "Stok Menipis", disabled: false });
  });

  it("AVAILABLE with zero stock → Sold Out (disabled)", () => {
    const b = badgeFor({ status: "AVAILABLE", remainingTickets: 0 });
    expect(b).toEqual({ tone: "soldout", label: "Sold Out", disabled: true });
  });

  it("AVAILABLE with no stock field defaults to Tersedia", () => {
    expect(badgeFor({ status: "AVAILABLE" }).label).toBe("Tersedia");
  });

  it("unknown status falls back defensively to Segera", () => {
    expect(badgeFor({ status: "WEIRD" as EventStatus }).label).toBe("Segera");
  });
});

const base: EventSummary = {
  id: "x",
  slug: "x",
  name: "X",
  salesStartsAt: "2026-01-01T00:00:00.000Z",
  salesEndsAt: "2026-02-01T00:00:00.000Z",
  status: "AVAILABLE",
};

const NOW = Date.parse("2026-06-01T00:00:00.000Z");

describe("isPastEvent", () => {
  it("CLOSED is always past", () => {
    expect(isPastEvent({ status: "CLOSED", startsAt: undefined }, NOW)).toBe(
      true,
    );
  });

  it("an event with no start date is not past", () => {
    expect(isPastEvent({ status: "AVAILABLE", startsAt: undefined }, NOW)).toBe(
      false,
    );
  });

  it("compares startsAt against the server clock", () => {
    expect(
      isPastEvent(
        { status: "AVAILABLE", startsAt: "2026-01-01T00:00:00Z" },
        NOW,
      ),
    ).toBe(true);
    expect(
      isPastEvent(
        { status: "AVAILABLE", startsAt: "2026-12-01T00:00:00Z" },
        NOW,
      ),
    ).toBe(false);
  });
});

describe("splitCatalog", () => {
  it("splits upcoming (asc) from history (desc) on the server clock", () => {
    const events: EventSummary[] = [
      { ...base, id: "late", startsAt: "2026-12-01T00:00:00Z" },
      { ...base, id: "soon", startsAt: "2026-07-01T00:00:00Z" },
      {
        ...base,
        id: "old",
        status: "CLOSED",
        startsAt: "2025-01-01T00:00:00Z",
      },
      {
        ...base,
        id: "older",
        status: "CLOSED",
        startsAt: "2024-01-01T00:00:00Z",
      },
      { ...base, id: "nodate", startsAt: undefined },
    ];
    const { upcoming, history } = splitCatalog(events, NOW);
    // upcoming sorted ascending; the dateless event sorts to the front (0).
    expect(upcoming.map((e) => e.id)).toEqual(["nodate", "soon", "late"]);
    // history sorted most-recent first.
    expect(history.map((e) => e.id)).toEqual(["old", "older"]);
  });

  it("returns empty arrays for an empty catalog", () => {
    expect(splitCatalog([], NOW)).toEqual({ upcoming: [], history: [] });
  });
});
