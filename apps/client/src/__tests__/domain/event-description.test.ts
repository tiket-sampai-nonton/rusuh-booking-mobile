import { parseDescription } from "@domain/rules/event-description";

describe("parseDescription — defensive rich-description parsing", () => {
  it("returns safe empty defaults for undefined", () => {
    const d = parseDescription(undefined);
    expect(d.longDesc).toBe("");
    expect(d.lineup).toEqual([]);
    expect(d.terms).toEqual([]);
    expect(d.bannerImage).toBeUndefined();
    expect(d.categories).toEqual([]);
  });

  it("returns safe defaults for a non-object value", () => {
    const d = parseDescription(42 as unknown as Record<string, unknown>);
    expect(d.longDesc).toBe("");
    expect(d.lineup).toEqual([]);
  });

  it("reads a plain string longDesc", () => {
    const d = parseDescription({ longDesc: "Festival musik." });
    expect(d.longDesc).toBe("Festival musik.");
  });

  it("ignores a non-string longDesc", () => {
    const d = parseDescription({ longDesc: { nested: true } });
    expect(d.longDesc).toBe("");
  });

  it("reads a string[] lineup (fixture shape)", () => {
    const d = parseDescription({ lineup: ["Band A", "Band B"] });
    expect(d.lineup).toEqual([
      { name: "Band A", role: "Performer" },
      { name: "Band B", role: "Performer" },
    ]);
  });

  it("maps the prototype {stage,acts} lineup shape to performer names", () => {
    const d = parseDescription({
      lineup: [{ stage: "Main", acts: "Band A" }, { acts: "DJ C" }],
    });
    expect(d.lineup).toEqual([
      { name: "Main — Band A", role: "Performer" },
      { name: "DJ C", role: "Performer" },
    ]);
  });

  it("preserves mock/API lineup details when provided", () => {
    const d = parseDescription({
      lineup: [
        {
          name: "Ahmad Dhani",
          role: "Keyboards",
          avatar: "https://example.test/a.png",
        },
      ],
    });
    expect(d.lineup).toEqual([
      {
        name: "Ahmad Dhani",
        role: "Keyboards",
        avatar: "https://example.test/a.png",
      },
    ]);
  });

  it("uses safe performer defaults and drops empty lineup records", () => {
    const d = parseDescription({
      lineup: [
        { name: "  Band C  ", role: "  ", avatar: "  " },
        { name: "   ", stage: "  ", acts: " " },
      ],
    });
    expect(d.lineup).toEqual([{ name: "Band C", role: "Performer" }]);
  });

  it("drops empty / non-string lineup entries", () => {
    const d = parseDescription({ lineup: ["Band A", "", 7, null] });
    expect(d.lineup).toEqual([{ name: "Band A", role: "Performer" }]);
  });

  it("wraps a single string terms value into an array", () => {
    const d = parseDescription({ terms: "Wajib KTP." });
    expect(d.terms).toEqual(["Wajib KTP."]);
  });

  it("drops blank terms and empty gallery entries", () => {
    const d = parseDescription({ terms: "  ", gallery: ["", "  ", 1] });
    expect(d.terms).toEqual([]);
    expect(d.gallery).toBeUndefined();
  });

  it("parses gallery images and a non-empty subtitle", () => {
    const d = parseDescription({
      gallery: ["https://example.test/a.jpg", "  ", 2],
      subtitle: "  Tur dua hari  ",
    });
    expect(d.gallery).toEqual(["https://example.test/a.jpg"]);
    expect(d.subtitle).toBe("Tur dua hari");
  });

  it("keeps optional subtitle and gallery absent when their values are malformed", () => {
    const d = parseDescription({ subtitle: 10, gallery: "not-an-array" });
    expect(d.subtitle).toBeUndefined();
    expect(d.gallery).toBeUndefined();
  });

  it("reads a string[] terms value", () => {
    const d = parseDescription({ terms: ["Wajib KTP.", "Maks 3"] });
    expect(d.terms).toEqual(["Wajib KTP.", "Maks 3"]);
  });

  it("reads a valid bannerImage string", () => {
    const d = parseDescription({ bannerImage: "https://x/y.jpg" });
    expect(d.bannerImage).toBe("https://x/y.jpg");
  });

  it("ignores an empty / non-string bannerImage", () => {
    expect(parseDescription({ bannerImage: "" }).bannerImage).toBeUndefined();
    expect(parseDescription({ bannerImage: 5 }).bannerImage).toBeUndefined();
  });

  it("parses pricing categories defensively, coercing availability", () => {
    const d = parseDescription({
      categories: [
        { code: "VIP", name: "VIP", priceMinor: 75000000, available: 10 },
        { code: "REG", name: "Reguler", priceMinor: 45000000, available: 0 },
        { name: "No code", priceMinor: 1 }, // available missing → 0
      ],
    });
    expect(d.categories).toEqual([
      { code: "VIP", name: "VIP", priceMinor: 75000000, available: 10 },
      { code: "REG", name: "Reguler", priceMinor: 45000000, available: 0 },
      { code: "", name: "No code", priceMinor: 1, available: 0 },
    ]);
  });

  it("drops category entries that are not objects", () => {
    const d = parseDescription({ categories: ["nope", 1, null] });
    expect(d.categories).toEqual([]);
  });

  it("defaults malformed optional description fields without throwing", () => {
    const d = parseDescription({
      lineup: [
        { name: " ", stage: " ", acts: " " },
        { stage: "Side Stage", acts: " " },
        { stage: " ", acts: "DJ Example" },
        false,
      ],
      terms: 42,
      categories: [
        {
          code: "BAD",
          name: "Invalid",
          priceMinor: Number.NaN,
          available: Infinity,
        },
      ],
      location: {
        name: " ",
        address: " ",
        mapsUrl: " ",
        mapImage: " ",
        latitude: Number.NaN,
        longitude: Infinity,
      },
      gallery: [],
      bannerImage: 10,
      subtitle: " ",
    });

    expect(d.lineup).toEqual([
      { name: "Side Stage", role: "Performer" },
      { name: "DJ Example", role: "Performer" },
    ]);
    expect(d.terms).toEqual([]);
    expect(d.categories[0]).toEqual({
      code: "BAD",
      name: "Invalid",
      priceMinor: 0,
      available: 0,
    });
    expect(d.location).toBeUndefined();
    expect(d.gallery).toBeUndefined();
    expect(d.bannerImage).toBeUndefined();
    expect(d.subtitle).toBeUndefined();
  });

  it("keeps a location with any valid coordinate or text field", () => {
    expect(
      parseDescription({
        location: { latitude: -6.9, longitude: 107.6, name: " Hall " },
      }).location,
    ).toEqual({ name: "Hall", latitude: -6.9, longitude: 107.6 });
  });
});
