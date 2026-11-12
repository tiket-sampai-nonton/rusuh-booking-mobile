import { StyleSheet } from "react-native";
import { designColors, designBorders } from "@presentation/theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: designColors.field,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  heading: { letterSpacing: 1.2, color: designColors.ink, marginBottom: 8 },
  body: { color: designColors.inkMuted },
  listIcon: { marginTop: 2 },
  item: { color: designColors.inkMuted },
});
