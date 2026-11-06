import { StyleSheet } from "react-native";

import { designBorders, designColors, interFonts } from "@presentation/theme";
import { hardShadowStyle, type DynamicStyle } from "@presentation/utils/style";

import {
  FRAME_PADDING,
  SPACE_L,
  SPACE_M,
  SPACE_S,
  SPACE_XS,
  TEXT_L,
  TEXT_M,
  TEXT_S,
  TEXT_XL,
  TEXT_XS,
} from "./constants";

export const componentStyles = StyleSheet.create({
  elementPosition0: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
    opacity: 0.25,
  },
  elementPosition1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: designColors.inkMuted, // #666666 - per Design Palette Guide
    opacity: 0.65,
  },
  elementPosition2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  elementFlexDirection3: {
    flexDirection: "row",
    gap: SPACE_S,
    backgroundColor: designColors.ink,
    padding: SPACE_S,
    alignSelf: "flex-start",
    marginBottom: SPACE_M,
  },
  elementAlignItems4: { alignItems: "center", minWidth: 50 },
  elementColor5: {
    color: designColors.ground,
    fontSize: TEXT_XL,
    fontFamily: interFonts.black, // weight 900
    fontVariant: ["tabular-nums"],
  },
  elementColor6: {
    color: designColors.ground,
    opacity: 0.7,
    fontSize: TEXT_XS,
    fontFamily: interFonts.medium, // weight 500
    textTransform: "uppercase",
    letterSpacing: 1.6, // letter-spacing: 0.1em = 1.6px at 16px
  },
  elementColor7: {
    color: designColors.ink,
    fontSize: TEXT_L,
    fontFamily: interFonts.medium, // weight 500
    marginBottom: SPACE_M,
    maxWidth: 320,
  },
  elementGap8: { gap: SPACE_XS, marginBottom: SPACE_S },
  elementFlexDirection9: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE_XS,
  },
  elementColor10: {
    color: designColors.ink,
    fontSize: TEXT_M,
    fontFamily: interFonts.medium, // weight 500
  },
  elementFlexDirection11: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE_XS,
  },
  elementColor12: {
    color: designColors.ink,
    fontSize: TEXT_M,
    fontFamily: interFonts.medium, // weight 500
  },
  elementColor13: {
    color: designColors.ink,
    fontSize: TEXT_XL,
    fontFamily: interFonts.black, // weight 900
    marginBottom: SPACE_M,
  },
  elementFontFamily14: { fontFamily: interFonts.black },
  elementFlexDirection15: {
    flexDirection: "row",
    gap: SPACE_XS,
    flexWrap: "wrap",
  },
  elementBackgroundColor16: {
    backgroundColor: designColors.ink,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    paddingVertical: 16, // .btn-large: 1rem
    paddingHorizontal: 32, // .btn-large: 2rem
  },
  elementColor17: {
    color: designColors.ground,
    fontSize: TEXT_M,
    fontFamily: interFonts.bold, // weight 700
    textTransform: "uppercase",
    letterSpacing: 0.64, // 0.04em at 16px
  },
  elementBackgroundColor18: {
    backgroundColor: designColors.ground,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  elementColor19: {
    color: designColors.ink,
    fontSize: TEXT_M,
    fontFamily: interFonts.bold, // weight 700
    textTransform: "uppercase",
    letterSpacing: 0.64,
  },
  elementFlexDirection20: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: designColors.ink,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginBottom: SPACE_S,
  },
  elementColor21: {
    color: designColors.ground,
    fontSize: TEXT_XS,
    fontFamily: interFonts.bold, // weight 700
    textTransform: "uppercase",
    letterSpacing: 0.6, // 0.05em at 12px
  },
  elementFlexDirection22: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACE_S,
    marginBottom: SPACE_M,
  },
  elementFlexDirection23: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  elementColor24: {
    color: designColors.inkMuted,
    fontSize: TEXT_S,
    fontFamily: interFonts.regular, // weight 400
  },
  elementFlexDirection25: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  elementColor26: {
    color: designColors.inkMuted,
    fontSize: TEXT_S,
    fontFamily: interFonts.regular, // weight 400
  },
  elementAlignSelf27: {
    alignSelf: "flex-start",
    backgroundColor: designColors.ink,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    ...hardShadowStyle(4, 4, designColors.ink, 4),
  },
  elementFlexDirection28: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: designColors.ink,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 44,
  },
  elementColor29: {
    color: designColors.ground,
    fontSize: TEXT_S,
    fontFamily: interFonts.bold, // weight 700
    textTransform: "uppercase",
    letterSpacing: 0.56, // 0.04em at 14px
  },
  elementPosition30: {
    position: "absolute",
    bottom: SPACE_L,
    right: FRAME_PADDING,
    flexDirection: "row",
    gap: 4,
    zIndex: 20,
  },
  elementWidth31: {
    width: 40,
    height: 2,
    backgroundColor: designColors.ink,
    overflow: "hidden",
  },
  elementPosition32: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  elementFlex33: { flex: 1, justifyContent: "flex-end" },
});

export function styleForHeroSlideAnimatedView0(): DynamicStyle {
  return {
    position: "absolute",
    // inset: -20px for parallax overflow (prototype .hero-slide-bg)
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
  } as DynamicStyle;
}

export function styleForHeroSlideAnimatedView1(): DynamicStyle {
  return { width: "100%", height: "100%" } as DynamicStyle;
}

export function styleForHeroSlideImage2(): DynamicStyle {
  return { width: "100%", height: "100%" } as DynamicStyle;
}

export function styleForGradientOverlayView3(): DynamicStyle {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  } as DynamicStyle;
}

export function styleForHeroTitleText4(
  arg0: number,
  arg1: number,
): DynamicStyle {
  return {
    color: designColors.ink,
    fontSize: arg0,
    fontFamily: interFonts.black, // Inter 900
    lineHeight: arg1 * 0.85, // line-height: 0.85
    textTransform: "uppercase",
    letterSpacing: arg1 * -0.03, // letter-spacing: -0.03em
  } as DynamicStyle;
}

export function styleForPulsingDotAnimatedView5(): DynamicStyle {
  return {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ff0000", // --danger
  } as DynamicStyle;
}

export function styleForHeroInfoMobileText6(arg0: number): DynamicStyle {
  return {
    color: designColors.ink,
    fontSize: arg0,
    fontFamily: interFonts.black, // weight 900
    lineHeight: arg0 * 1.1, // line-height: 1.1 to prevent top clipping
    textTransform: "uppercase",
    letterSpacing: arg0 * -0.02, // letter-spacing: -0.02em
    marginBottom: SPACE_S,
  } as DynamicStyle;
}

export function styleForNavDotPressable7(arg0: boolean): DynamicStyle {
  return {
    width: arg0 ? 60 : 40, // active: 60px, default: 40px
    height: 4,
    backgroundColor: designColors.inkMuted,
    overflow: "hidden",
    position: "relative",
  } as DynamicStyle;
}

export function styleForNavDotAnimatedView8(): DynamicStyle {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: designColors.ink,
    transformOrigin: "left",
  } as DynamicStyle;
}

export function styleForNavDotAnimatedView9(): DynamicStyle {
  return { transform: [{ scaleX: 0 }] } as DynamicStyle;
}

export function styleForScrollIndicatorAnimatedView10(): DynamicStyle {
  return {
    position: "absolute",
    bottom: SPACE_L,
    left: FRAME_PADDING,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE_S,
    zIndex: 20,
  } as DynamicStyle;
}

export function styleForScrollIndicatorAnimatedView11(): DynamicStyle {
  return {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: designColors.inkMuted,
  } as DynamicStyle;
}

export function styleForHeroCarouselView12(arg0: number): DynamicStyle {
  return {
    minHeight: arg0,
    position: "relative",
    overflow: "hidden",
  } as DynamicStyle;
}

export function styleForHeroCarouselView13(
  arg0: boolean,
  arg1: boolean,
): DynamicStyle {
  return {
    position: "absolute",
    bottom: arg0 ? SPACE_L : SPACE_L + 40, // Native: no extra room for dots at bottom
    left: FRAME_PADDING,
    right: FRAME_PADDING,
    zIndex: 10,
    // Desktop: row layout with title + info side by side
    // Native: single column (mobile prototype has Badge→Title→Meta→CTA stacked)
    flexDirection: arg0 || arg1 ? "column" : "row",
    gap: arg1 ? SPACE_M : SPACE_L,
    alignItems: arg1 ? "flex-start" : "flex-end",
  } as DynamicStyle;
}

export function styleForHeroCarouselView14(): DynamicStyle {
  return { width: "100%" } as DynamicStyle;
}

export function styleForHeroCarouselView15(): DynamicStyle {
  return { width: 400 } as DynamicStyle;
}

export function heroInfoColumnStyle(
  isNarrow: boolean,
): ReturnType<typeof styleForHeroCarouselView14> {
  if (isNarrow) return styleForHeroCarouselView14();
  return styleForHeroCarouselView15();
}
