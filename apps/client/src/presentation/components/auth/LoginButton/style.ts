import { StyleSheet } from "react-native";
import { tokens, withAlpha } from "@presentation/theme";

export const componentStyles = StyleSheet.create({
  elementBorderRadius0: {
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: tokens.neutral.line,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: withAlpha(tokens.neutral.ink, 0.05),
  },
  elementFontWeight1: {
    fontWeight: tokens.fontWeight.semibold,
    fontSize: tokens.fontSize.base,
    color: tokens.neutral.ink,
  },
});
