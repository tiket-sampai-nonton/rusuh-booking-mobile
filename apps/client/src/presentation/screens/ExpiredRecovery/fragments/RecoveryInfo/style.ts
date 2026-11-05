
import { StyleSheet } from "react-native";
import { designColors, designBorder } from "@presentation/theme";

export const styles = StyleSheet.create({
  container: { backgroundColor: designColors.field, borderWidth: designBorder.base, borderColor: designColors.ink },
  heading: { letterSpacing: 1.2, color: designColors.ink, marginBottom: 8 },
  body: { color: designColors.inkMuted },
  listIcon: { marginTop: 2 },
  item: { color: designColors.inkMuted },
});
