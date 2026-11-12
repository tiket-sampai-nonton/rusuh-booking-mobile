import { StyleSheet } from "react-native";
import {
  designColors,
  plusJakartaSansFonts,
  designInput,
  designBorders,
} from "@presentation/theme";

import { type DynamicStyle, hardShadowStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementGap0: { gap: 8 },
  elementFontSize1: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 12 * 0.1, // --tracking-wider
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.regular,
  },
  elementFontSize2: {
    fontSize: 12,
    color: designColors.danger,
    fontWeight: "600",
    fontFamily: plusJakartaSansFonts.regular,
  },
  elementFontSize3: {
    fontSize: 12,
    color: designColors.inkMuted,
    fontFamily: plusJakartaSansFonts.regular,
  },
});

export function styleForComponentAnimatedView0(arg0: boolean): DynamicStyle {
  return {
    // Cyan hard shadow marks focus while keeping the field surface neutral.
    ...hardShadowStyle(
      arg0 ? 4 : 0,
      arg0 ? 4 : 0,
      designColors.ember,
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
    fontFamily: plusJakartaSansFonts.regular,
  } as DynamicStyle;
}
