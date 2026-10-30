import { EVENT_IMAGES, eventImage } from "@domain/rules/event-image";

describe("eventImage", () => {
  it("prefers an explicit banner image when present", () => {
    expect(eventImage("evt-1", "https://cdn/x.jpg")).toBe("https://cdn/x.jpg");
  });

  it("falls back to a stable photo from the set by event id", () => {
    const a = eventImage("evt-1");
    const b = eventImage("evt-1");
    expect(a).toBe(b); // deterministic
    expect(EVENT_IMAGES).toContain(a);
  });

  it("ignores an empty / nullish banner and uses the fallback", () => {
    expect(EVENT_IMAGES).toContain(eventImage("evt-2", ""));
    expect(EVENT_IMAGES).toContain(eventImage("evt-2", null));
    expect(EVENT_IMAGES).toContain(eventImage("evt-2", undefined));
  });

  it("spreads different ids across the set (hashing works)", () => {
    const picks = new Set(
      ["a", "b", "c", "d", "e", "f", "g", "hh", "ii"].map((id) => eventImage(id)),
    );
    expect(picks.size).toBeGreaterThan(1);
  });
});
