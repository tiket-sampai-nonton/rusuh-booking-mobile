import type { DynamicStyle } from "@presentation/utils/style";
import {
  designBorders,
  designColors,
  designButton,
  interFonts,
} from "@presentation/theme";

export function styleForButtonPressable0(
  arg0:
    | { bg: "#ffffff"; fg: "#000000"; fill: "#000000"; filledFg: "#ffffff" }
    | { bg: "#ff0000"; fg: "#ffffff"; fill: "#000000"; filledFg: "#ffffff" }
    | { bg: "#000000"; fg: "#ffffff"; fill: "#ffffff"; filledFg: "#000000" },
  arg1: 10 | 16,
  arg2: 20 | 32,
  arg3: boolean,
): DynamicStyle {
  return {
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: arg0.bg,
    paddingVertical: arg1,
    paddingHorizontal: arg2,
    overflow: "hidden",
    opacity: arg3 ? 0.5 : 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  } as DynamicStyle;
}

export function styleForButtonAnimatedView1(
  arg0:
    | { bg: "#ffffff"; fg: "#000000"; fill: "#000000"; filledFg: "#ffffff" }
    | { bg: "#ff0000"; fg: "#ffffff"; fill: "#000000"; filledFg: "#ffffff" }
    | { bg: "#000000"; fg: "#ffffff"; fill: "#ffffff"; filledFg: "#000000" },
): DynamicStyle {
  return {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: arg0.fill,
  } as DynamicStyle;
}

export function styleForButtonAnimatedText2(
  arg0: 16 | 14,
  arg1: 16 | 14,
): DynamicStyle {
  return {
    fontSize: arg0,
    fontWeight: designButton.fontWeight,
    textTransform: "uppercase",
    letterSpacing: arg1 * designButton.letterSpacing,
    fontFamily: interFonts.bold,
  } as DynamicStyle;
}

export function styleForButtonText3(
  arg0:
    | { bg: "#ffffff"; fg: "#000000"; fill: "#000000"; filledFg: "#ffffff" }
    | { bg: "#ff0000"; fg: "#ffffff"; fill: "#000000"; filledFg: "#ffffff" }
    | { bg: "#000000"; fg: "#ffffff"; fill: "#ffffff"; filledFg: "#000000" },
  arg1: 16 | 14,
): DynamicStyle {
  return {
    color: arg0.fg,
    fontSize: arg1,
    fontWeight: designButton.fontWeight,
    fontFamily: interFonts.bold,
  } as DynamicStyle;
}
