import { eventJsonLd } from "@presentation/components/Seo";

/**
 * The <Seo> component renders into the DOM <head> via react-native-helmet-async
 * only during web static export, so its visual output is verified by the static
 * export check in the RBT-033 evidence (meta/robots/canonical/JSON-LD asserted
 * against the generated HTML). Here we unit-test the pure JSON-LD builder, which
 * carries the branching logic.
 */
describe("eventJsonLd", () => {
  it("builds a schema.org Event with url + optional fields", () => {
    const ld = eventJsonLd({
      name: "Rusuh Fest",
      path: "/events/evt-1",
      startsAt: "2026-12-01T12:00:00.000Z",
      venue: "GBK",
      priceFromMinor: 4500000,
    });
    expect(ld["@type"]).toBe("Event");
    expect(ld.name).toBe("Rusuh Fest");
    expect(ld.url).toContain("/events/evt-1");
    expect(ld.startDate).toBe("2026-12-01T12:00:00.000Z");
    expect(ld.location).toEqual({ "@type": "Place", name: "GBK" });
    expect((ld.offers as Record<string, unknown>).price).toBe(45000);
    expect((ld.offers as Record<string, unknown>).availability).toBe(
      "https://schema.org/InStock",
    );
  });

  it("omits optional fields when absent and marks sold-out availability", () => {
    const ld = eventJsonLd({ name: "X", path: "/events/x", soldOut: true });
    expect(ld).not.toHaveProperty("startDate");
    expect(ld).not.toHaveProperty("location");
    expect(ld).not.toHaveProperty("offers"); // no price → no offers
    expect(ld.name).toBe("X");
  });

  it("marks sold-out availability when a price is present", () => {
    const ld = eventJsonLd({
      name: "Y",
      path: "/events/y",
      priceFromMinor: 100,
      soldOut: true,
    });
    expect((ld.offers as Record<string, unknown>).availability).toBe(
      "https://schema.org/SoldOut",
    );
  });
});
