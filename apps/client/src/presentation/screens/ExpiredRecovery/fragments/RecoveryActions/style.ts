
import { StyleSheet } from "react-native";
import { designColors } from "@presentation/theme";

import { designBorder } from "@presentation/theme";

export const styles = StyleSheet.create({
  primaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: designColors.ink,
    borderWidth: designBorder.base,
    borderColor: designColors.ink,
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: designBorder.base,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  requeueButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: designColors.ground,
    borderWidth: designBorder.base,
    borderColor: designColors.ink,
  },
  primaryText: { color: designColors.ground, letterSpacing: 0.5, fontSize: 14, fontWeight: "700", textTransform: "uppercase" },
  homeText: { color: designColors.ink, fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  requeueText: { color: designColors.ink, letterSpacing: 0.5, fontSize: 14, fontWeight: "700", textTransform: "uppercase" },
});
