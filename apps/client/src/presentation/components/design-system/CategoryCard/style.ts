import { StyleSheet } from "react-native";
import { designColors, designSpacingSemantic } from "@presentation/theme";

import type { ImageStyle } from "react-native";
import type { DynamicStyle } from "@presentation/utils/style";
import { interFonts } from "@presentation/theme";

export const componentStyles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    overflow: "hidden",
    position: "relative",
    backgroundColor: designColors.ground,
  },
  elementPosition0: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: designSpacingSemantic.m,
  },
});

export function getCategoryImageStyle(
  isWeb: boolean,
  isHovered: boolean,
): ImageStyle {
  if (!isWeb) return { width: "100%", height: "100%" };

  return {
    width: "100%",
    height: "100%",
    filter: isHovered
      ? "grayscale(0%) brightness(0.6)"
      : "grayscale(100%) brightness(0.5)",
    transition: "filter 0.6s cubic-bezier(0.33, 1, 0.68, 1)",
  } as unknown as ImageStyle;
}

export function styleForCategoryCardAnimatedView0(): DynamicStyle {
  return { position: "absolute", inset: 0 } as DynamicStyle;
}

export function styleForCategoryCardAnimatedView1(): DynamicStyle {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#808080",
  } as DynamicStyle;
}

export function styleForCategoryCardAnimatedView2(): DynamicStyle {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: designColors.ink,
  } as DynamicStyle;
}

export function styleForCategoryCardAnimatedView3(): DynamicStyle {
  return {
    position: "absolute",
    top: designSpacingSemantic.s,
    left: designSpacingSemantic.s,
    right: designSpacingSemantic.s,
    bottom: designSpacingSemantic.s,
    borderWidth: 2,
    borderColor: designColors.ground,
  } as DynamicStyle;
}

export function styleForCategoryCardAnimatedText4(): DynamicStyle {
  return {
    color: designColors.ground,
    fontSize: 20,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontFamily: interFonts.bold,
  } as DynamicStyle;
}

export function styleForCategoryCardAnimatedText5(): DynamicStyle {
  return {
    color: designColors.ground,
    fontSize: 14,
    fontFamily: interFonts.bold,
    marginTop: 4,
  } as DynamicStyle;
}
