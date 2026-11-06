import {
  browseCategoryLabel,
  browseCategoriesInner,
  browseGridCell,
  browseGridList,
  browseGridRow,
  browseHeroText,
  browseLoadMoreLabel,
  browseMain,
  browseScrollContent,
} from "@presentation/screens/Browse/style";

describe("Browse style variants", () => {
  it("selects compact and desktop layout rules", () => {
    expect(browseScrollContent(12, false)).toEqual({ paddingBottom: 100 });
    expect(browseScrollContent(12, true)).toMatchObject({
      maxWidth: 1400,
      width: "100%",
      alignSelf: "center",
    });
    expect(browseCategoriesInner(false).maxWidth).toBeUndefined();
    expect(browseCategoriesInner(true).maxWidth).toBe(1400);
    expect(browseMain(false).maxWidth).toBeUndefined();
    expect(browseMain(true).maxWidth).toBe(1400);
    expect(browseHeroText(false)).toMatchObject({
      fontSize: 40,
      lineHeight: 36,
    });
    expect(browseHeroText(true)).toMatchObject({
      fontSize: 80,
      lineHeight: 72,
    });
  });

  it("covers active labels and both view modes including default flags", () => {
    expect(browseCategoryLabel(false).color).not.toBe(
      browseCategoryLabel(true).color,
    );
    expect(browseLoadMoreLabel(false).color).not.toBe(
      browseLoadMoreLabel(true).color,
    );
    expect(browseGridRow().marginHorizontal).toBe(-16);
    expect(browseGridRow(true).marginHorizontal).toBe(-8);
    expect(browseGridList().gap).toBe(16);
    expect(browseGridList(true).gap).toBe(16);
    expect(browseGridCell(2).paddingHorizontal).toBe(16);
    expect(browseGridCell(2, true).paddingHorizontal).toBe(8);
  });
});
