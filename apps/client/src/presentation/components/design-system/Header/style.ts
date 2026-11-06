import { StyleSheet } from "react-native";
import { designColors, designBorders, interFonts } from "@presentation/theme";
import type { ViewStyle } from "react-native";

import type { DynamicStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementColor2: {
    color: designColors.ink,
    fontSize: 18,
    fontFamily: interFonts.black, // weight 900
    textTransform: "uppercase",
    letterSpacing: 0.36, // 0.02em * 18
  },
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
    fontFamily: interFonts.bold,
  },
  elementBorderWidth8: {
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ink,
    paddingVertical: 8,
    paddingHorizontal: 16,
    overflow: "hidden",
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
    fontFamily: interFonts.bold, // weight 700
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
