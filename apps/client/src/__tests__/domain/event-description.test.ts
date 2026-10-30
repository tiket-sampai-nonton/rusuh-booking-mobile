import { parseDescription } from "@domain/rules/event-description";

describe("parseDescription", () => {
  it("parses a well-formed description bag", () => {
    expect(
      parseDescription({
        longDesc: "Festival terbesar",
        lineup: ["Band A", "Band B"],
        terms: "Wajib KTP",
        bannerImage: "https://cdn/x.jpg",
      }),
    ).toEqual({
      longDesc: "Festival terbesar",
      lineup: ["Band A", "Band B"],
      terms: "Wajib KTP",
      bannerImage: "https://cdn/x.jpg",
    });
  });

  it("returns empty defaults for null / undefined", () => {
    const empty = { longDesc: "", lineup: [], terms: "", bannerImage: undefined };
    expect(parseDescription(null)).toEqual(empty);
    expect(parseDescription(undefined)).toEqual(empty);
    expect(parseDescription({})).toEqual(empty);
  });

  it("drops wrong-typed fields defensively", () => {
    expect(
      parseDescription({
        longDesc: 123 as unknown as string,
        lineup: "not-an-array" as unknown as string[],
        terms: null as unknown as string,
      }),
    ).toEqual({ longDesc: "", lineup: [], terms: "", bannerImage: undefined });
  });

  it("filters non-string / empty entries out of lineup", () => {
    expect(
      parseDescription({ lineup: ["A", "", 7, null, "B"] as unknown as string[] })
        .lineup,
    ).toEqual(["A", "B"]);
  });

  it("omits an empty-string bannerImage", () => {
    expect(parseDescription({ bannerImage: "" }).bannerImage).toBeUndefined();
  });
});
