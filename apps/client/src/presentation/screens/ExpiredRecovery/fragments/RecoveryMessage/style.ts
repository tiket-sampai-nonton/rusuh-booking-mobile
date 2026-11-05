
import { StyleSheet } from "react-native";
import { designColors, designBorder } from "@presentation/theme";

export const styles = StyleSheet.create({
  icon: { borderWidth: designBorder.base, borderColor: designColors.danger },
  title: { letterSpacing: -0.5, color: designColors.ink },
  body: { color: designColors.inkMuted, maxWidth: 280 },
});
