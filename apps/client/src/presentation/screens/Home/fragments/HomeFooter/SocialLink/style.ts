import { StyleSheet } from "react-native";

import { interFonts, designBorders, designColors } from "@presentation/theme";
import type { DynamicStyle } from "@presentation/utils/style";

export const socialLinkStyles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderWidth: designBorders.standard,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    width: 40,
    height: 40,
    backgroundColor: designColors.ground,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: interFonts.bold,
    zIndex: 1,
  },
});

export function socialLinkBorderStyle(): DynamicStyle {
  return { borderColor: designColors.ground } as DynamicStyle;
}

export function socialLinkContainerColor(
  hovered: number,
  groundColor: string,
): string {
  "worklet";
  return hovered > 0.5 ? "transparent" : groundColor;
}

export function socialLinkTextColor(
  hovered: number,
  inkColor: string,
  groundColor: string,
): string {
  "worklet";
  return hovered > 0.5 ? inkColor : groundColor;
}
