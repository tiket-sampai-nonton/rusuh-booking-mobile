import { StyleSheet } from "react-native";
import { designColors, designBorders } from "@presentation/theme";

export const styles = StyleSheet.create({
  icon: {
    borderWidth: designBorders.standard,
    borderColor: designColors.danger,
  },
  title: { letterSpacing: -0.5, color: designColors.ink },
  body: { color: designColors.inkMuted, maxWidth: 280 },
});
