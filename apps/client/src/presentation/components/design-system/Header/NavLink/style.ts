import { StyleSheet } from "react-native";

import { plusJakartaSansFonts, designColors } from "@presentation/theme";

export const navLinkStyles = StyleSheet.create({
  container: {
    position: "relative",
  },
  label: {
    color: designColors.ink,
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.bold,
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
