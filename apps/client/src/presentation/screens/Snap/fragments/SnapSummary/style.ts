import { StyleSheet } from "react-native";

import { designColors, designBorders } from "@presentation/theme";

export const snapSummaryStyles = StyleSheet.create({
  container: {
    backgroundColor: designColors.field,
    borderWidth: designBorders.standard,
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
