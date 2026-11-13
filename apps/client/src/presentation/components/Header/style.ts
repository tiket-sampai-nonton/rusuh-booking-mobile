import { StyleSheet } from "react-native";
import {
  designColors,
  designBorders,
  plusJakartaSansFonts,
} from "@presentation/theme";
import type { ViewStyle } from "react-native";

import type { DynamicStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementFlexDirection3: { flexDirection: "row", gap: 24 },
  elementFlexDirection4: { flexDirection: "row", gap: 8 },
  elementPosition5: { position: "relative" },
  elementPosition6: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designColors.danger,
    borderRadius: 9,
  },
  elementColor7: {
    color: designColors.ground,
    fontSize: 10,
    fontFamily: plusJakartaSansFonts.bold,
  },
  elementBorderWidth8: {
    borderWidth: designBorders.standard,
    borderColor: designColors.accent,
    backgroundColor: designColors.accentDeep,
    paddingVertical: 8,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  mobileActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mobileCta: {
    minWidth: 70,
    minHeight: 44,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  mobileCtaText: {
    color: designColors.ink,
    fontSize: 12,
    fontFamily: plusJakartaSansFonts.bold,
    textTransform: "uppercase",
  },
  mobileMenuToggle: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  menuLine: {
    width: 16,
    height: 2,
    backgroundColor: designColors.ink,
  },
  mobileMenuItem: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: designColors.inkMuted,
  },
  mobileMenuLabel: {
    color: designColors.ink,
    fontSize: 15,
    fontFamily: plusJakartaSansFonts.bold,
  },
  mobileMenuArrow: {
    color: designColors.inkMuted,
    fontSize: 24,
  },
});

export function styleForHeaderAnimatedView2(): DynamicStyle {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: designColors.ground,
  } as DynamicStyle;
}

export function styleForHeaderAnimatedText3(): DynamicStyle {
  return {
    fontSize: 12,
    fontFamily: plusJakartaSansFonts.bold, // weight 700
    textTransform: "uppercase",
    letterSpacing: 0.48, // 0.04em * 12
  } as DynamicStyle;
}

export const headerContainerStyle: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
};

export function headerInnerStyle(topInset: number): ViewStyle {
  return {
    paddingTop: topInset,
    backgroundColor: designColors.ground,
    borderBottomWidth: designBorders.standard,
    borderBottomColor: designColors.ink,
  };
}

export function headerRowStyle(headerHeight: number): ViewStyle {
  return {
    height: headerHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  };
}

export function headerMobileMenuBackdrop(top: number): ViewStyle {
  return {
    position: "absolute",
    top,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  };
}

export function headerMobileMenuPanel(top: number): ViewStyle {
  return {
    position: "absolute",
    top,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 16,
    backgroundColor: designColors.ground,
    borderBottomWidth: designBorders.standard,
    borderBottomColor: designColors.ink,
  };
}
