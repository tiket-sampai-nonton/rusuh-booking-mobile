import { StyleSheet } from "react-native";
import { designColors, plusJakartaSansFonts } from "@presentation/theme";

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
    fontFamily: plusJakartaSansFonts.regular,
  },
  elementColor2: {
    color: designColors.ground,
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.bold, // weight 700
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
  isMobileWeb = false,
): ViewStyle {
  let aspectRatio: number | undefined;
  let width: ViewStyle["width"] = "100%";
  let height: ViewStyle["height"];
  if (isNative) {
    aspectRatio = listMode ? 16 / 9 : 1;
  } else if (isMobileWeb && listMode) {
    width = 100;
  } else if (!listMode) {
    aspectRatio = 4 / 3;
  } else if (isWeb && listMode) {
    width = 240;
    height = 160;
  }

  return {
    aspectRatio,
    width,
    height,
    alignSelf: isMobileWeb && listMode ? "stretch" : undefined,
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
  isMobileWeb = false,
): ViewStyle {
  let justifyContent: ViewStyle["justifyContent"];
  if (isNative) {
    justifyContent = "space-between";
  } else if (isWeb && listMode) {
    justifyContent = "center";
  }

  return {
    padding: contentPadding,
    minHeight:
      isMobileWeb && listMode
        ? 116
        : isNative || (isWeb && listMode)
          ? 160
          : undefined,
    justifyContent,
    flex: isWeb && listMode ? 1 : undefined,
  };
}

export function eventCardFooterStyle(
  isNative: boolean,
  isMobileWeb = false,
): ViewStyle {
  return {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: isMobileWeb ? 0 : designSpacingSemantic.s,
    borderTopWidth: isMobileWeb ? 0 : isNative ? 1 : designBorders.standard,
    borderStyle: isNative ? "dashed" : "solid",
    borderTopColor: designColors.ink,
    marginTop: isMobileWeb
      ? 4
      : isNative
        ? designSpacingSemantic.s
        : designSpacingSemantic.m,
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

export function styleForEventCardPressable2(isMobileWeb = false): DynamicStyle {
  return {
    flexDirection: "row",
    minHeight: isMobileWeb ? 116 : 160,
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
    // Mobile: pink bg (sold out), desktop: black bg unless sold out.
    backgroundColor,
    paddingHorizontal: arg0 ? 8 : 10, // Mobile: 0.5rem = 8px
    paddingVertical: arg0 ? 4 : 4, // Mobile: 0.25rem = 4px
  } as DynamicStyle;
}

export function styleForEventCardText6(arg0: boolean): DynamicStyle {
  return {
    color: designColors.ground,
    fontSize: arg0 ? MOBILE_BADGE_SIZE : 12, // Mobile: 10px
    fontFamily: plusJakartaSansFonts.bold, // weight 700
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
    fontFamily: plusJakartaSansFonts.medium, // weight 500
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
    fontFamily: arg1
      ? plusJakartaSansFonts.bold
      : plusJakartaSansFonts.extraBold, // Mobile: 700, Desktop: 900
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
    fontFamily: plusJakartaSansFonts.regular, // weight 400
  } as DynamicStyle;
}

export function styleForEventCardText11(arg0: boolean): DynamicStyle {
  return {
    color: designColors.ink,
    fontSize: arg0 ? 14 : 16,
    fontFamily: plusJakartaSansFonts.bold, // Mobile: 700, Desktop: similar
  } as DynamicStyle;
}

export function styleForEventCardView12(
  disabled: boolean,
  isHovered = false,
): DynamicStyle {
  const isActive = isHovered && !disabled;
  return {
    width: MOBILE_ACTION_SIZE,
    height: MOBILE_ACTION_SIZE,
    borderWidth: designBorders.standard,
    borderColor: isActive ? designColors.danger : designColors.ink,
    backgroundColor: disabled
      ? designColors.inkMuted
      : isActive
        ? designColors.danger
        : designColors.ground,
    alignItems: "center",
    justifyContent: "center",
  } as DynamicStyle;
}

export function styleForEventCardView13(
  disabled: boolean,
  isHovered = false,
): DynamicStyle {
  return {
    backgroundColor: disabled
      ? designColors.inkMuted
      : isHovered
        ? designColors.danger
        : designColors.ink,
    borderWidth: designBorders.standard,
    borderColor: disabled
      ? designColors.inkMuted
      : isHovered
        ? designColors.danger
        : designColors.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
  } as DynamicStyle;
}
