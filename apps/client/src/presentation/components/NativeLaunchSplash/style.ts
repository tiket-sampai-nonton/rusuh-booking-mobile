import { StyleSheet } from "react-native";
import {
  plusJakartaSansFonts,
  designColors,
  withAlpha,
  brand,
} from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementPosition0: {
    position: "absolute",
    top: 24,
    left: 24,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: withAlpha(designColors.ground, 0.2),
  },
  elementPosition1: {
    position: "absolute",
    top: 24,
    right: 24,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: withAlpha(designColors.ground, 0.2),
  },
  elementPosition2: {
    position: "absolute",
    bottom: 24,
    left: 24,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: withAlpha(designColors.ground, 0.2),
  },
  elementPosition3: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 24,
    height: 24,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: withAlpha(designColors.ground, 0.2),
  },
  elementPosition4: {
    position: "absolute",
    top: 28,
    right: 56,
    color: withAlpha(designColors.ground, 0.4),
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  buildLabel: {
    position: "absolute",
    alignSelf: "center",
    color: withAlpha(designColors.ground, 0.55),
    fontFamily: plusJakartaSansFonts.semiBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  elementAlignItems5: { alignItems: "center", gap: 12, maxWidth: "100%" },
  elementFlexDirection7: { flexDirection: "column", alignItems: "center" },
  elementFlexDirection8: { flexDirection: "row" },
  elementFlexDirection9: { flexDirection: "row" },
  elementColor10: {
    color: withAlpha(designColors.ground, 0.6),
    fontFamily: plusJakartaSansFonts.medium,
    fontSize: 12,
    letterSpacing: 0.4,
    maxWidth: "100%",
    flexShrink: 1,
    textAlign: "center",
  },
  elementPosition11: {
    position: "absolute",
    right: 40,
    bottom: 70,
    left: 40,
    alignItems: "center",
    gap: 10,
  },
  elementWidth12: {
    width: "100%",
    height: 2,
    overflow: "hidden",
    backgroundColor: withAlpha(designColors.ground, 0.2),
  },
  elementColor13: {
    color: withAlpha(designColors.ground, 0.4),
    fontFamily: plusJakartaSansFonts.semiBold,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.5,
    textAlign: "center",
    minWidth: 84,
    flexShrink: 1,
    paddingHorizontal: 4,
  },
});

export function styleForNativeLaunchSplashAnimatedView1(): DynamicStyle {
  return {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: designColors.ink,
  } as DynamicStyle;
}

export function styleForNativeLaunchSplashAnimatedView2(): DynamicStyle {
  return {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: brand.primary,
    backgroundColor: withAlpha(brand.deep, 0.24),
  } as DynamicStyle;
}

export function styleForNativeLaunchSplashAnimatedView3(): DynamicStyle {
  return {
    height: "100%",
    backgroundColor: designColors.ground,
  } as DynamicStyle;
}
