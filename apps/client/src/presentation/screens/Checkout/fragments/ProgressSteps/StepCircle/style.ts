import { StyleSheet } from "react-native";

import { designColors, designBorders, interFonts } from "@presentation/theme";

export const stepCircleStyles = StyleSheet.create({
  circle: {
    width: 40,
    height: 40,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  filledCircle: {
    backgroundColor: designColors.ink,
  },
  emptyCircle: {
    backgroundColor: designColors.ground,
  },
  number: {
    fontSize: 14,
    fontFamily: interFonts.bold,
  },
  filledNumber: {
    color: designColors.ground,
  },
  emptyNumber: {
    color: designColors.ink,
  },
});
