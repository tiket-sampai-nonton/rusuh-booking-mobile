import { StyleSheet } from "react-native";
import { designColors, designBorder } from "@presentation/theme";


import type { EdgeInsets } from "react-native-safe-area-context";
import type { DynamicStyle } from "@presentation/utils/style";

export const successStyles = StyleSheet.create({
  scrollContent: { paddingBottom: 12 },
});

export const componentStyles = StyleSheet.create({
  elementBorderWidth1: { borderWidth: 2, borderColor: designColors.ground },
  elementColor2: { color: designColors.success, letterSpacing: 2 },
  elementLetterSpacing3: { letterSpacing: -1 },
  elementBackgroundColor4: {
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            },
  elementBackgroundColor5: { backgroundColor: designColors.ground, borderWidth: designBorder.base, borderColor: designColors.ground },
  elementColor6: { color: designColors.ink, letterSpacing: 0.5 },
  elementBorderWidth7: { borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  elementLetterSpacing8: { letterSpacing: 0.5 },
  elementColor9: { color: designColors.accent },
  elementFontSize10: { fontSize: 14, color: "rgba(255,255,255,0.6)" },
});

export function styleForSuccessScreenView0(arg0: EdgeInsets): DynamicStyle {
  return { backgroundColor: designColors.ink, paddingTop: arg0.top + 16, paddingBottom: arg0.bottom + 16 } as DynamicStyle;
}
