import { Platform, StyleSheet } from "react-native";
import { interFonts } from "@presentation/theme/fonts";
import { designColors } from "@presentation/theme/event-design-tokens";

import { Animated } from "react-native";
import type { DynamicStyle } from "@presentation/utils/style";

export const heroStyles = StyleSheet.create({
  // Web: gradient from white at bottom
  overlayWeb: {
    backgroundColor: "transparent",
    ...(Platform.OS === "web" && {
      backgroundImage: `linear-gradient(
        to top,
        ${designColors.ground} 0%,
        rgba(255,255,255,0.8) 30%,
        rgba(255,255,255,0.3) 60%,
        rgba(255,255,255,0) 100%
      )`,
    }),
  },
  // Native grayscale layers (simulates grayscale filter)
  nativeGrayscaleDark: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  nativeGrayscaleGray: {
    backgroundColor: "rgba(128, 128, 128, 0.65)",
  },
  metaIcon: {
    fontSize: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 15,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  chipText: {
    fontFamily: interFonts.semiBold,
    fontSize: 11,
    color: designColors.ink,
    textTransform: "uppercase",
  },
});

export function styleForDetailHeroAnimatedView0(
  arg0: Animated.Value,
): DynamicStyle {
  return { transform: [{ scale: arg0 }] } as DynamicStyle;
}

export function styleForDetailHeroImage1(): DynamicStyle {
  return { filter: "grayscale(100%) contrast(1.2)" } as DynamicStyle;
}

export function styleForDetailHeroAnimatedView2(
  arg0: Animated.Value,
  arg1: Animated.Value,
): DynamicStyle {
  return {
    opacity: arg0,
    transform: [{ translateY: arg1 }],
  } as DynamicStyle;
}

export function styleForDetailHeroAnimatedText3(
  arg0: Animated.Value,
  arg1: Animated.Value,
): DynamicStyle {
  return {
    opacity: arg0,
    transform: [{ translateY: arg1 }],
  } as DynamicStyle;
}

export function styleForDetailHeroAnimatedText4(
  arg0: Animated.Value,
  arg1: Animated.Value,
): DynamicStyle {
  return {
    opacity: arg0,
    transform: [{ translateY: arg1 }],
  } as DynamicStyle;
}

export function styleForDetailHeroAnimatedView5(
  arg0: Animated.Value,
  arg1: Animated.Value,
): DynamicStyle {
  return {
    opacity: arg0,
    transform: [{ translateY: arg1 }],
  } as DynamicStyle;
}

export function styleForDetailHeroAnimatedView6(
  arg0: Animated.Value,
  arg1: Animated.Value,
): DynamicStyle {
  return {
    opacity: arg0,
    transform: [{ translateY: arg1 }],
  } as DynamicStyle;
}
