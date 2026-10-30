import type { EventSummary } from "@domain/repositories/event.repository";
import {
  LOW_STOCK_THRESHOLD,
  badgeFor,
  isPastEvent,
  splitCatalog,
} from "@domain/rules/event-display";

const base: EventSummary = {
  id: "e",
  slug: "e",
  name: "E",
  salesStartsAt: "2026-01-01T00:00:00.000Z",
  salesEndsAt: "2026-02-01T00:00:00.000Z",
  status: "AVAILABLE",
};

describe("badgeFor", () => {
  it("AVAILABLE with plenty of stock → Tersedia (ok, enabled)", () => {
    expect(badgeFor({ status: "AVAILABLE", remainingTickets: 500 })).toEqual({
      tone: "ok",
      label: "Tersedia",
      disabled: false,
    });
  });

  it("AVAILABLE with no remaining count → Tersedia (ok)", () => {
    expect(badgeFor({ status: "AVAILABLE" })).toEqual({
      tone: "ok",
      label: "Tersedia",
      disabled: false,
    });
  });

  it("AVAILABLE below the low-stock threshold → Stok Menipis (low)", () => {
    expect(
      badgeFor({ status: "AVAILABLE", remainingTickets: LOW_STOCK_THRESHOLD - 1 }),
    ).toEqual({ tone: "low", label: "Stok Menipis", disabled: false });
  });

  it("AVAILABLE with zero remaining → Sold Out (disabled)", () => {
    expect(badgeFor({ status: "AVAILABLE", remainingTickets: 0 })).toEqual({
      tone: "soldout",
      label: "Sold Out",
      disabled: true,
    });
  });

  it("SOLD_OUT → Sold Out (disabled)", () => {
    expect(badgeFor({ status: "SOLD_OUT" }).disabled).toBe(true);
    expect(badgeFor({ status: "SOLD_OUT" }).tone).toBe("soldout");
  });

  it("CLOSED → Selesai (done, disabled)", () => {
    expect(badgeFor({ status: "CLOSED" })).toEqual({
      tone: "done",
      label: "Selesai",
      disabled: true,
    });
  });

  it("NOT_STARTED → Segera (soon, enabled)", () => {
    expect(badgeFor({ status: "NOT_STARTED" })).toEqual({
      tone: "soon",
      label: "Segera",
      disabled: false,
    });
  });

  it("falls back to Segera for an unknown status (defensive)", () => {
    expect(badgeFor({ status: "WEIRD" as never })).toEqual({
      tone: "soon",
      label: "Segera",
      disabled: false,
    });
  });
});

describe("isPastEvent", () => {
  const now = Date.parse("2026-06-01T00:00:00.000Z");

  it("CLOSED is always past", () => {
    expect(isPastEvent({ status: "CLOSED", startsAt: undefined }, now)).toBe(true);
  });

  it("no startsAt (and not CLOSED) is not past", () => {
    expect(isPastEvent({ status: "AVAILABLE", startsAt: undefined }, now)).toBe(
      false,
    );
  });

  it("startsAt before serverNow is past", () => {
    expect(
      isPastEvent({ status: "AVAILABLE", startsAt: "2026-05-01T00:00:00.000Z" }, now),
    ).toBe(true);
  });

  it("startsAt after serverNow is not past", () => {
    expect(
      isPastEvent({ status: "AVAILABLE", startsAt: "2026-07-01T00:00:00.000Z" }, now),
    ).toBe(false);
  });

  it("an invalid startsAt is treated as not past", () => {
    expect(isPastEvent({ status: "AVAILABLE", startsAt: "not-a-date" }, now)).toBe(
      false,
    );
  });
});

describe("splitCatalog", () => {
  const now = Date.parse("2026-06-01T00:00:00.000Z");

  it("splits upcoming (asc) from history (desc) on the server clock", () => {
    const events: EventSummary[] = [
      { ...base, id: "future-late", startsAt: "2026-09-01T00:00:00.000Z" },
      { ...base, id: "future-soon", startsAt: "2026-07-01T00:00:00.000Z" },
      { ...base, id: "past-old", status: "CLOSED", startsAt: "2025-01-01T00:00:00.000Z" },
      { ...base, id: "past-recent", status: "CLOSED", startsAt: "2026-01-01T00:00:00.000Z" },
    ];
    const { upcoming, history } = splitCatalog(events, now);
    expect(upcoming.map((e) => e.id)).toEqual(["future-soon", "future-late"]);
    expect(history.map((e) => e.id)).toEqual(["past-recent", "past-old"]);
  });

  it("treats an event with an invalid/missing startsAt as sort key 0", () => {
    const events: EventSummary[] = [
      { ...base, id: "no-date", startsAt: undefined },
      { ...base, id: "dated", startsAt: "2026-07-01T00:00:00.000Z" },
    ];
    const { upcoming } = splitCatalog(events, now);
    // no-date (key 0) sorts before the dated upcoming event
    expect(upcoming[0].id).toBe("no-date");
  });

  it("returns empty sections for an empty catalog", () => {
    expect(splitCatalog([], now)).toEqual({ upcoming: [], history: [] });
  });
});
