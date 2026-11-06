import { StyleSheet } from "react-native";
import { designColors, interFonts } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";
import { hardShadowStyle } from "@presentation/utils/style";
import { designInput, designBorders } from "@presentation/theme";

export const componentStyles = StyleSheet.create({
  elementGap0: { gap: 8 },
  elementFontSize1: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 12 * 0.1, // --tracking-wider
    color: designColors.ink,
    fontFamily: interFonts.regular,
  },
  elementFontSize2: {
    fontSize: 12,
    color: designColors.danger,
    fontWeight: "600",
    fontFamily: interFonts.regular,
  },
  elementFontSize3: {
    fontSize: 12,
    color: designColors.inkMuted,
    fontFamily: interFonts.regular,
  },
});

export function styleForComponentAnimatedView0(arg0: boolean): DynamicStyle {
  return {
    // Shadow only when focused (4px 4px 0 #000)
    ...hardShadowStyle(
      arg0 ? 4 : 0,
      arg0 ? 4 : 0,
      designColors.ink,
      arg0 ? 4 : 0,
    ),
  } as DynamicStyle;
}

export function styleForComponentAnimatedTextInput1(
  arg0: string,
): DynamicStyle {
  return {
    padding: designInput.paddingY,
    borderWidth: designBorders.standard,
    borderColor: arg0,
    backgroundColor: designColors.ground,
    fontSize: designInput.fontSize,
    fontWeight: designInput.fontWeight,
    color: designColors.ink,
    fontFamily: interFonts.regular,
  } as DynamicStyle;
}
