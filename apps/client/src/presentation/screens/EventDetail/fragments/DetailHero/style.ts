import { Platform, StyleSheet, Animated } from "react-native";
import { plusJakartaSansFonts } from "@presentation/theme/fonts";
import { designColors } from "@presentation/theme/event-design-tokens";
import { withAlpha } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const heroStyles = StyleSheet.create({
  // Web: gradient from white at bottom
  overlayWeb: {
    backgroundColor: designColors.transparent,
    ...(Platform.OS === "web" && {
      backgroundImage: `linear-gradient(
        to top,
        ${designColors.ground} 0%,
        ${withAlpha(designColors.ground, 0.8)} 30%,
        ${withAlpha(designColors.ground, 0.3)} 60%,
        ${withAlpha(designColors.ground, 0)} 100%
      )`,
    }),
  },
  mobileWebOverlay: {
    backgroundColor: designColors.transparent,
    ...(Platform.OS === "web" && {
      backgroundImage: `linear-gradient(to top, ${withAlpha(designColors.overlay, 0.92)} 0%, ${withAlpha(designColors.overlay, 0.42)} 42%, ${withAlpha(designColors.overlay, 0.08)} 100%)`,
    }),
  },
  // Native grayscale layers (simulates grayscale filter)
  nativeGrayscaleDark: {
    backgroundColor: withAlpha(designColors.overlay, 0.25),
  },
  nativeGrayscaleGray: {
    backgroundColor: withAlpha(designColors.inkMuted, 0.65),
  },
  metaIcon: {
    fontSize: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: 8,
    marginTop: 15,
  },
  chip: {
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  chipText: {
    fontFamily: plusJakartaSansFonts.semiBold,
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

export const styleForDetailHeroAnimatedText3 = styleForDetailHeroAnimatedView2;

export const styleForDetailHeroAnimatedText4 = styleForDetailHeroAnimatedText3;

export const styleForDetailHeroAnimatedView5 = styleForDetailHeroAnimatedText3;

export const styleForDetailHeroAnimatedView6 = styleForDetailHeroAnimatedText3;
