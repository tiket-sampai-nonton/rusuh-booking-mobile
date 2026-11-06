import { StyleSheet } from "react-native";
import { designColors, interFonts } from "@presentation/theme";

import type { ViewStyle, ImageStyle } from "react-native";
import { designBorders, designSpacingSemantic } from "@presentation/theme";
import type { DynamicStyle } from "@presentation/utils/style";
import type { EventBadge } from "@domain/rules/event-display";

const MOBILE_VENUE_SIZE = 12;

export const componentStyles = StyleSheet.create({
  elementWidth0: { width: "100%", height: "100%" },
  elementColor1: {
    color: designColors.inkMuted,
    fontSize: MOBILE_VENUE_SIZE,
    fontFamily: interFonts.regular,
  },
  elementColor2: {
    color: designColors.ground,
    fontSize: 14,
    fontFamily: interFonts.bold, // weight 700
    textTransform: "uppercase",
    letterSpacing: 0.56,
  },
});

export const MOBILE_BADGE_SIZE = 10;

export const MOBILE_ACTION_SIZE = 32;

export function eventCardContainerStyle(
  isHovered: boolean,
  disabled: boolean,
  isNative: boolean,
): ViewStyle {
  return {
    backgroundColor: designColors.ground,
    position: "relative",
    zIndex: isHovered ? 10 : 0,
    opacity: disabled ? 0.62 : 1,
    borderWidth: isNative ? designBorders.standard : 0,
    borderColor: isNative ? designColors.ink : undefined,
  };
}

export function eventCardImageContainerStyle(
  isNative: boolean,
  listMode: boolean,
  isWeb: boolean,
): ViewStyle {
  let aspectRatio: number | undefined;
  if (isNative) {
    aspectRatio = listMode ? 16 / 9 : 1;
  } else if (!listMode) {
    aspectRatio = 4 / 3;
  }

  return {
    aspectRatio,
    width: isWeb && listMode ? 240 : "100%",
    height: isWeb && listMode ? 160 : undefined,
    flexShrink: 0,
    overflow: "hidden",
    position: "relative",
  };
}

export function eventCardImageStyle(
  isWeb: boolean,
  isHovered: boolean,
): ImageStyle {
  if (!isWeb) return { width: "100%", height: "100%" };
  return {
    width: "100%",
    height: "100%",
    filter: isHovered ? "grayscale(0%)" : "grayscale(100%)",
    transition: "filter 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
  } as unknown as ImageStyle;
}

export function eventCardContentStyle(
  contentPadding: number,
  isNative: boolean,
  isWeb: boolean,
  listMode: boolean,
): ViewStyle {
  let justifyContent: ViewStyle["justifyContent"];
  if (isNative) {
    justifyContent = "space-between";
  } else if (isWeb && listMode) {
    justifyContent = "center";
  }

  return {
    padding: contentPadding,
    minHeight: isNative || (isWeb && listMode) ? 160 : undefined,
    justifyContent,
    flex: isWeb && listMode ? 1 : undefined,
  };
}

export function eventCardFooterStyle(isNative: boolean): ViewStyle {
  return {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: designSpacingSemantic.s,
    borderTopWidth: isNative ? 1 : designBorders.standard,
    borderStyle: isNative ? "dashed" : "solid",
    borderTopColor: designColors.ink,
    marginTop: isNative ? designSpacingSemantic.s : designSpacingSemantic.m,
  };
}

export function styleForEventCardView0(): DynamicStyle {
  return { position: "relative", width: "100%" } as DynamicStyle;
}

export function styleForEventCardAnimatedView1(): DynamicStyle {
  return {
    position: "absolute",
    top: 4,
    right: -4,
    bottom: -4,
    left: 4,
    backgroundColor: designColors.ink,
  } as DynamicStyle;
}

export function styleForEventCardPressable2(): DynamicStyle {
  return {
    flexDirection: "row",
    minHeight: 160,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  } as DynamicStyle;
}

export function styleForEventCardAnimatedView3(): DynamicStyle {
  return { flex: 1 } as DynamicStyle;
}

export function styleForEventCardAnimatedView4(): DynamicStyle {
  return {
    position: "absolute",
    width: "100%",
    height: "100%",
  } as DynamicStyle;
}

export function styleForEventCardAnimatedView5(
  arg0: boolean,
  arg1: EventBadge,
): DynamicStyle {
  const backgroundColor =
    arg0 || arg1.tone === "soldout" ? designColors.danger : designColors.ink;
  return {
    position: "absolute",
    top: designSpacingSemantic.xs,
    left: designSpacingSemantic.xs,
    // Mobile: red bg (danger), Desktop: black bg (ink) unless soldout
    backgroundColor,
    paddingHorizontal: arg0 ? 8 : 10, // Mobile: 0.5rem = 8px
    paddingVertical: arg0 ? 4 : 4, // Mobile: 0.25rem = 4px
  } as DynamicStyle;
}

export function styleForEventCardText6(arg0: boolean): DynamicStyle {
  return {
    color: designColors.ground,
    fontSize: arg0 ? MOBILE_BADGE_SIZE : 12, // Mobile: 10px
    fontFamily: interFonts.bold, // weight 700
    textTransform: "uppercase",
    letterSpacing: 0.48, // 0.04em
  } as DynamicStyle;
}

export function styleForEventCardText7(
  arg0: 14 | 12,
  arg1: boolean,
): DynamicStyle {
  return {
    color: designColors.inkMuted,
    fontSize: arg0,
    fontFamily: interFonts.medium, // weight 500
    textTransform: arg1 ? "uppercase" : "none", // Mobile: uppercase
    letterSpacing: arg1 ? 0.6 : 0, // Mobile: 0.05em at 12px
    marginBottom: arg1 ? 4 : 8, // Mobile: 0.25rem = 4px
  } as DynamicStyle;
}

export function styleForEventCardAnimatedText8(
  arg0: 20 | 16,
  arg1: boolean,
): DynamicStyle {
  return {
    color: designColors.ink,
    fontSize: arg0,
    fontFamily: arg1 ? interFonts.bold : interFonts.black, // Mobile: 700, Desktop: 900
    textTransform: arg1 ? "none" : "uppercase", // Mobile: NOT uppercase
    lineHeight: arg1 ? arg0 * 1.3 : undefined, // Mobile: line-height 1.3
    // Mobile: fixed height for 2 lines to ensure consistent card height
    height: arg1 ? arg0 * 1.3 * 2 : undefined,
  } as DynamicStyle;
}

export function styleForEventCardView9(arg0: boolean): DynamicStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: arg0 ? 4 : 0, // Mobile: 0.25rem gap for icon
    marginTop: 8,
  } as DynamicStyle;
}

export function styleForEventCardText10(arg0: 14 | 12): DynamicStyle {
  return {
    color: designColors.inkMuted,
    fontSize: arg0,
    fontFamily: interFonts.regular, // weight 400
  } as DynamicStyle;
}

export function styleForEventCardText11(arg0: boolean): DynamicStyle {
  return {
    color: designColors.ink,
    fontSize: arg0 ? 14 : 16,
    fontFamily: interFonts.bold, // Mobile: 700, Desktop: similar
  } as DynamicStyle;
}

export function styleForEventCardView12(arg0: boolean): DynamicStyle {
  return {
    width: MOBILE_ACTION_SIZE,
    height: MOBILE_ACTION_SIZE,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: arg0 ? designColors.inkMuted : designColors.ground,
    alignItems: "center",
    justifyContent: "center",
  } as DynamicStyle;
}

export function styleForEventCardView13(arg0: boolean): DynamicStyle {
  return {
    backgroundColor: arg0 ? designColors.inkMuted : designColors.ink,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
  } as DynamicStyle;
}
