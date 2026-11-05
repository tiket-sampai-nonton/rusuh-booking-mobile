import { Platform, StyleSheet } from "react-native";

import { designColors, interFonts } from "@presentation/theme";
import type { DynamicStyle } from "@presentation/utils/style";

export const checkoutFieldStyles = StyleSheet.create({
  container: { marginTop: 16 },
  label: {
    color: designColors.ink,
    fontSize: 12,
    fontFamily: interFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  error: {
    color: designColors.danger,
    fontSize: 12,
    fontFamily: interFonts.medium,
    marginTop: 4,
  },
});

export function fieldInputStyle(invalid: boolean, editable: boolean): DynamicStyle {
  return {
    borderWidth: 2,
    borderColor: invalid ? designColors.danger : designColors.ink,
    backgroundColor: editable ? designColors.ground : designColors.field,
    color: designColors.ink,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: interFonts.regular,
    fontSize: 16,
  } as DynamicStyle;
}

export function fieldFocusStyle(isFocused: boolean): DynamicStyle {
  if (!isFocused) return {};
  return Platform.select({
      web: {
        boxShadow: "4px 4px 0 #000",
        transform: [{ translateX: -2 }, { translateY: -2 }],
      } as object,
      default: {
        marginLeft: -2,
        marginTop: -2,
        borderWidth: 3,
      },
    }) as DynamicStyle;
}
