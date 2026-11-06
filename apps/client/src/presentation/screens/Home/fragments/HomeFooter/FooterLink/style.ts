import { StyleSheet } from "react-native";

import { plusJakartaSansFonts, designColors } from "@presentation/theme";
import type { DynamicStyle } from "@presentation/utils/style";

export const footerLinkStyles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  content: {
    position: "relative",
  },
  label: {
    color: designColors.ground,
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.bold,
    opacity: 0.8,
  },
});

export function footerUnderlineStyle(): DynamicStyle {
  return {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: designColors.ground,
    transformOrigin: "left",
  } as DynamicStyle;
}
