import {
  defaultCheckoutCategory,
  reconcileCheckoutCategories,
} from "@domain/rules/checkout";

describe("checkout category availability", () => {
  const categories = [
    { categoryId: "sold", available: 0 },
    { categoryId: "open", available: 2 },
  ];
  const row = {
    rowId: "1",
    categoryId: "",
    attendeeName: "",
    attendeeNik: "",
    useBuyerNik: false,
  };

  it("defaults to an available category and leaves no default when all are sold out", () => {
    expect(defaultCheckoutCategory(categories)).toBe("open");
    expect(defaultCheckoutCategory([categories[0]!])).toBe("");
    expect(reconcileCheckoutCategories([row], categories)[0]?.categoryId).toBe(
      "open",
    );
  });

  it("clears an existing selection when it becomes sold out", () => {
    expect(
      reconcileCheckoutCategories(
        [{ ...row, categoryId: "sold" }],
        categories,
      )[0]?.categoryId,
    ).toBe("");
  });
});
