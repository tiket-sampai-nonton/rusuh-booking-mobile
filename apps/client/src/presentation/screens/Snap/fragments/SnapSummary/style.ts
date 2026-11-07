import { StyleSheet } from "react-native";

import { designColors, designBorder } from "@presentation/theme";

export const snapSummaryStyles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    borderWidth: designBorder.base,
    borderColor: designColors.ink,
  },
  label: {
    color: designColors.gray,
  },
  value: {
    color: designColors.ink,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: designColors.field,
  },
});
