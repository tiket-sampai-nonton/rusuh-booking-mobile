import {
  homeContainer,
  homeGridCell,
  homeNavPill,
  homeNavWrap,
  homeScrollContent,
} from "../../../../presentation/screens/Home/style";

describe("home screen style factories", () => {
  it("adds the bottom inset and only centers the desktop container when needed", () => {
    expect(homeScrollContent(32)).toEqual({ paddingBottom: 32 });
    expect(homeContainer(false)).toBeUndefined();
    expect(homeContainer(true)).toMatchObject({
      maxWidth: 1180,
      width: "100%",
      alignSelf: "center",
    });
  });

  it("computes the safe-area nav position, width cap, and grid cell width", () => {
    expect(homeNavWrap(40)).toMatchObject({
      top: 48,
      left: 0,
      right: 0,
      alignItems: "center",
    });
    expect(homeNavPill(390)).toMatchObject({ maxWidth: 362, paddingLeft: 20 });
    expect(homeGridCell(2)).toMatchObject({
      width: "50%",
      paddingHorizontal: 11,
      marginBottom: 22,
    });
  });
});
