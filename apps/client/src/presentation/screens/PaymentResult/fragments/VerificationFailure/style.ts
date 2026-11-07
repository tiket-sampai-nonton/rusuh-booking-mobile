import { StyleSheet } from "react-native";
import { designColors } from "@presentation/theme";

export const styles = StyleSheet.create({
  returnButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designColors.accent,
  },
  returnText: {
    color: designColors.ground,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
