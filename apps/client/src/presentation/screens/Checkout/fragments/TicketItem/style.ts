
import { StyleSheet } from "react-native";
import { designColors, interFonts } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementMarginTop0: {
        marginTop: 16,
        borderWidth: 2,
        borderColor: designColors.ink,
        backgroundColor: designColors.ground,
        padding: 20,
      },
  elementFlexDirection1: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  elementFontSize2: {
            fontSize: 14,
            fontFamily: interFonts.bold,
            color: designColors.ink,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          },
  elementFontSize3: {
                fontSize: 12,
                fontFamily: interFonts.bold,
                color: "#ff0000",
                textTransform: "uppercase",
              },
  elementMarginTop4: {
          marginTop: 16,
          fontSize: 10,
          fontFamily: interFonts.bold,
          color: designColors.gray,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
  elementMarginTop5: { marginTop: 8, flexDirection: "row", gap: 8, flexWrap: "wrap" },
  elementMarginTop6: { marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  elementFlex7: {
            flex: 1,
            paddingRight: 12,
            fontSize: 13,
            fontFamily: interFonts.regular,
            color: designColors.ink,
          },
});

export function styleForTicketItemPressable0(arg0: boolean): DynamicStyle {
  return {
                borderWidth: 2,
                borderColor: designColors.ink,
                backgroundColor: arg0 ? designColors.ink : designColors.ground,
                paddingHorizontal: 16,
                paddingVertical: 10,
              } as DynamicStyle;
}

export function styleForTicketItemText1(arg0: boolean): DynamicStyle {
  return {
                  fontSize: 12,
                  fontFamily: interFonts.bold,
                  color: arg0 ? designColors.ground : designColors.ink,
                  textTransform: "uppercase",
                } as DynamicStyle;
}

export function styleForTicketItemText2(arg0: { label: string; color: string; }): DynamicStyle {
  return {
            marginTop: 8,
            fontSize: 11,
            fontFamily: interFonts.medium,
            color: arg0.color,
          } as DynamicStyle;
}
