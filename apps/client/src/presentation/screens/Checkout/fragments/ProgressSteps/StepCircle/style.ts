import { StyleSheet } from "react-native";

import {
  designColors,
  designBorders,
  plusJakartaSansFonts,
} from "@presentation/theme";

export const stepCircleStyles = StyleSheet.create({
  circle: {
    width: 40,
    height: 40,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  compactCircle: { width: 26, height: 26, borderWidth: 1 },
  filledCircle: {
    backgroundColor: designColors.ink,
  },
  emptyCircle: {
    backgroundColor: designColors.ground,
  },
  number: {
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.bold,
  },
  compactNumber: { fontSize: 11 },
  filledNumber: {
    color: designColors.ground,
  },
  emptyNumber: {
    color: designColors.ink,
  },
});
