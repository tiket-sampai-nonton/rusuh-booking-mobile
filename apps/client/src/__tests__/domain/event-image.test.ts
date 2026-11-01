import { EVENT_IMAGES, eventImage } from "@domain/rules/event-image";

describe("eventImage", () => {
  it("prefers an explicit bannerImage when present", () => {
    expect(eventImage("evt-1", "https://cdn.example/banner.jpg")).toBe(
      "https://cdn.example/banner.jpg",
    );
  });

  it("falls back to a stable photo keyed by event id (deterministic)", () => {
    const a = eventImage("evt-1");
    const b = eventImage("evt-1");
    expect(a).toBe(b);
    expect(EVENT_IMAGES).toContain(a);
  });

  it("ignores an empty bannerImage and uses the id fallback", () => {
    const url = eventImage("evt-2", "");
    expect(EVENT_IMAGES).toContain(url);
  });

  it("maps different ids across the image set", () => {
    const urls = ["a", "b", "c", "d", "e", "f", "g", "h"].map((id) =>
      eventImage(id),
    );
    urls.forEach((u) => expect(EVENT_IMAGES).toContain(u));
  });
});
