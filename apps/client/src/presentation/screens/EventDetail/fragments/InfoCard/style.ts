
import { StyleSheet } from "react-native";
import { interFonts } from "@presentation/theme/fonts";
import { designBorders, designColors, designFontSizes, designSpacingSemantic } from "@presentation/theme/event-design-tokens";

import { Animated } from "react-native";
import type { DynamicStyle } from "@presentation/utils/style";

export const infoStyles = StyleSheet.create({
  card: {
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    padding: designSpacingSemantic.m,
    marginBottom: designSpacingSemantic.m,
    backgroundColor: designColors.ground,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: designSpacingSemantic.s,
    marginBottom: designSpacingSemantic.s,
  },
  rowLast: {
    marginBottom: 0,
  },
  iconContainer: {
    width: 20,
    height: 20,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  label: {
    fontFamily: interFonts.medium,
    fontSize: designFontSizes.xs,
    color: designColors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: designFontSizes.xs * 0.05,
  },
  value: {
    fontFamily: interFonts.semiBold,
    fontSize: designFontSizes.s,
    color: designColors.ink,
    marginTop: 2,
  },
});

export function styleForInfoCardAnimatedView0(arg0: Animated.Value, arg1: Animated.Value): DynamicStyle {
  return {
          opacity: arg0,
          transform: [{ translateY: arg1 }],
        } as DynamicStyle;
}
