
import { StyleSheet } from "react-native";
import { designColors, interFonts } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementMarginTop0: {
        marginTop: 16,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 14,
        borderWidth: 2,
        borderColor: designColors.ink,
        backgroundColor: designColors.ground,
        padding: 20,
      },
  elementFlex1: {
          flex: 1,
          fontSize: 13,
          lineHeight: 20,
          color: designColors.ink,
          fontFamily: interFonts.regular,
        },
  elementFontFamily2: { fontFamily: interFonts.bold, textDecorationLine: "underline" },
});

export function styleForConsentGateView0(arg0: boolean): DynamicStyle {
  return {
          marginTop: 2,
          width: 24,
          height: 24,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: designColors.ink,
          backgroundColor: arg0 ? designColors.ink : designColors.ground,
        } as DynamicStyle;
}
