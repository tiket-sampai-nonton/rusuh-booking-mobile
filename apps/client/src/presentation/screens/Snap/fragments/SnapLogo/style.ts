import { StyleSheet } from "react-native";
import { designColors, designBorder } from "@presentation/theme";

export const componentStyles = StyleSheet.create({
  elementAlignItems0: {
    alignItems: "center",
    paddingBottom: 24,
    borderBottomWidth: designBorder.base,
    borderBottomColor: designColors.ink,
  },
  elementColor1: {
    color: designColors.ink,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.64,
    marginBottom: 4,
  },
  elementColor2: { color: designColors.gray, fontSize: 14 },
});
