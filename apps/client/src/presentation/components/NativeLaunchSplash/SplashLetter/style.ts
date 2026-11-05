import { interFonts, designColors } from "@presentation/theme";
import type { DynamicStyle } from "@presentation/utils/style";

export function splashLetterStyle(index: number): DynamicStyle {
  return {
    color: index === 0 ? "#ff0000" : designColors.ground,
    fontFamily: interFonts.black,
    fontSize: 34,
    lineHeight: 38,
  } as DynamicStyle;
}
