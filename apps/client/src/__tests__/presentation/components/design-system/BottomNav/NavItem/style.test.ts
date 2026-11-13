import { designColors } from "@presentation/theme";
import { navItemBackgroundStyle } from "@presentation/components/BottomNav/NavItem/style";

describe("bottom navigation pressed background", () => {
  it("uses a transparent default and the field color while pressed", () => {
    expect(navItemBackgroundStyle(0, designColors.field)).toEqual({
      backgroundColor: "transparent",
    });
    expect(navItemBackgroundStyle(0.75, designColors.field)).toEqual({
      backgroundColor: designColors.field,
    });
  });
});
