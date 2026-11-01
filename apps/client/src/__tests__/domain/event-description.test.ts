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
    expect(d.lineup).toEqual(["Band A", "Band B"]);
  });

  it("maps an object[] lineup ({stage,acts}) to strings (prototype shape)", () => {
    const d = parseDescription({
      lineup: [{ stage: "Main", acts: "Band A" }, { acts: "DJ C" }],
    });
    expect(d.lineup).toEqual(["Main — Band A", "DJ C"]);
  });

  it("drops empty / non-string lineup entries", () => {
    const d = parseDescription({ lineup: ["Band A", "", 7, null] });
    expect(d.lineup).toEqual(["Band A"]);
  });

  it("wraps a single string terms value into an array", () => {
    const d = parseDescription({ terms: "Wajib KTP." });
    expect(d.terms).toEqual(["Wajib KTP."]);
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
});
