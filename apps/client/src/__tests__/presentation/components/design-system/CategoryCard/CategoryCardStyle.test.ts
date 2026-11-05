import {
  getCategoryImageStyle,
  styleForCategoryCardAnimatedText4,
  styleForCategoryCardAnimatedText5,
  styleForCategoryCardAnimatedView0,
  styleForCategoryCardAnimatedView1,
  styleForCategoryCardAnimatedView2,
  styleForCategoryCardAnimatedView3,
} from "@presentation/components/design-system/CategoryCard/style";

describe("CategoryCard style helpers", () => {
  it("keeps native images full color and gives web images both hover filters", () => {
    expect(getCategoryImageStyle(false, false)).toEqual({ width: "100%", height: "100%" });
    expect(getCategoryImageStyle(true, false)).toMatchObject({
      filter: "grayscale(100%) brightness(0.5)",
      transition: expect.stringContaining("filter"),
    });
    expect(getCategoryImageStyle(true, true)).toMatchObject({
      filter: "grayscale(0%) brightness(0.6)",
      transition: expect.stringContaining("filter"),
    });
  });

  it("provides styles for every animated overlay and label", () => {
    expect(styleForCategoryCardAnimatedView0()).toMatchObject({ position: "absolute" });
    expect(styleForCategoryCardAnimatedView1()).toMatchObject({ backgroundColor: "#808080" });
    expect(styleForCategoryCardAnimatedView2()).toMatchObject({ position: "absolute" });
    expect(styleForCategoryCardAnimatedView3()).toMatchObject({ borderWidth: 2 });
    expect(styleForCategoryCardAnimatedText4()).toMatchObject({ textTransform: "uppercase" });
    expect(styleForCategoryCardAnimatedText5()).toMatchObject({ marginTop: 4 });
  });
});
