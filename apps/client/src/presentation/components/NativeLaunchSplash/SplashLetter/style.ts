import { plusJakartaSansFonts, designColors } from "@presentation/theme";
import type { DynamicStyle } from "@presentation/utils/style";

export function splashLetterStyle(index: number): DynamicStyle {
  return {
    color: index === 0 ? designColors.accent : designColors.ground,
    fontFamily: plusJakartaSansFonts.extraBold,
    fontSize: 34,
    lineHeight: 38,
  } as DynamicStyle;
}
