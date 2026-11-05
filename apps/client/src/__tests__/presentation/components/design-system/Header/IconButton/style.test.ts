import { designColors } from "@presentation/theme";
import {
  iconButtonBackgroundColor,
  iconButtonForegroundColor,
  iconButtonShadowStyle,
} from "@presentation/components/design-system/Header/IconButton/style";

describe("header icon button pressed styles", () => {
  it("returns platform shadows and both foreground/background states", () => {
    expect(iconButtonShadowStyle(0, "web", designColors.ink)).toEqual({ boxShadow: `2px 2px 0 ${designColors.ink}` });
    expect(iconButtonShadowStyle(1, "web", designColors.ink)).toEqual({ boxShadow: `0px 0px 0 ${designColors.ink}` });
    expect(iconButtonShadowStyle(0, "android", designColors.ink)).toEqual({ elevation: 2 });
    expect(iconButtonShadowStyle(1, "android", designColors.ink)).toEqual({ elevation: 0 });
    expect(iconButtonShadowStyle(0, "ios", designColors.ink)).toEqual({ elevation: 2 });
    expect(iconButtonBackgroundColor(0, designColors.ink, designColors.ground)).toBe(designColors.ground);
    expect(iconButtonBackgroundColor(1, designColors.ink, designColors.ground)).toBe(designColors.ink);
    expect(iconButtonForegroundColor(0)).toBe(designColors.ink);
    expect(iconButtonForegroundColor(1)).toBe(designColors.ground);
  });
});
