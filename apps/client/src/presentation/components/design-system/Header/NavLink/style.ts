import { StyleSheet } from "react-native";

import { interFonts, designColors } from "@presentation/theme";

export const navLinkStyles = StyleSheet.create({
  container: {
    position: "relative",
  },
  label: {
    color: designColors.ink,
    fontSize: 14,
    fontFamily: interFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 0.56,
  },
  underline: {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: designColors.ink,
  },
});
