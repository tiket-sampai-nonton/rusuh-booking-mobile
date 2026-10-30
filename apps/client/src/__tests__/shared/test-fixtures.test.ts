import { EVENT_FIXTURES } from "@shared/test-fixtures/events.fixture";
import { MockEventRepository } from "@infrastructure/__fixtures__/mock-event.repository";
import type { EventStatus } from "@domain/repositories/event.repository";

describe("shared/test-fixtures — events", () => {
  it("provides at least 5 events", () => {
    expect(EVENT_FIXTURES.length).toBeGreaterThanOrEqual(5);
  });

  it("includes the three special statuses the AC requires", () => {
    const statuses = new Set<EventStatus>(EVENT_FIXTURES.map((e) => e.status));
    expect(statuses.has("SOLD_OUT")).toBe(true);
    expect(statuses.has("NOT_STARTED")).toBe(true);
    expect(statuses.has("CLOSED")).toBe(true);
    expect(statuses.has("AVAILABLE")).toBe(true);
  });

  it("carries the FE-NEED O1 fields (remainingTickets + description JSON)", () => {
    for (const e of EVENT_FIXTURES) {
      expect(typeof e.remainingTickets).toBe("number");
      expect(e.description).toBeDefined();
      expect(e.description).toHaveProperty("longDesc");
    }
  });

  it("every fixture has unique id + slug and required contract fields", () => {
    const ids = new Set(EVENT_FIXTURES.map((e) => e.id));
    const slugs = new Set(EVENT_FIXTURES.map((e) => e.slug));
    expect(ids.size).toBe(EVENT_FIXTURES.length);
    expect(slugs.size).toBe(EVENT_FIXTURES.length);
    for (const e of EVENT_FIXTURES) {
      expect(e.salesStartsAt).toMatch(/^\d{4}-/);
      expect(e.salesEndsAt).toMatch(/^\d{4}-/);
      expect(typeof e.minPriceMinor).toBe("number");
    }
  });

  it("SOLD_OUT / CLOSED events have zero remaining tickets", () => {
    for (const e of EVENT_FIXTURES) {
      if (e.status === "SOLD_OUT" || e.status === "CLOSED") {
        expect(e.remainingTickets).toBe(0);
      }
    }
  });
});

describe("MockEventRepository serves the shared fixtures", () => {
  const repo = new MockEventRepository();

  it("lists all fixture events as summaries (description stripped)", async () => {
    const list = await repo.listEvents();
    expect(list).toHaveLength(EVENT_FIXTURES.length);
    expect(list[0]).not.toHaveProperty("description");
    expect(list[0]).toHaveProperty("status");
  });

  it("returns full detail (with description) for a known event", async () => {
    const detail = await repo.getEventDetail("evt-1");
    expect(detail.name).toBe("Rusuh Fest 2026");
    expect(detail.description).toHaveProperty("lineup");
  });

  it("throws for an unknown event", async () => {
    await expect(repo.getEventDetail("ghost")).rejects.toThrow(/unknown event/);
  });
});
