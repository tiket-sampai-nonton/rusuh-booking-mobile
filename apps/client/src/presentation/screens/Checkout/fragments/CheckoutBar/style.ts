import { StyleSheet } from "react-native";
import { designColors, designBorders, interFonts } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: designColors.ink,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: designBorders.standard,
    borderTopColor: designColors.ground,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    fontFamily: interFonts.medium,
    textAlign: "center",
    marginBottom: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontFamily: interFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  totalValue: {
    color: designColors.ground,
    fontSize: 20,
    fontFamily: interFonts.black,
    letterSpacing: -0.4,
  },
  payButton: {
    borderWidth: designBorders.standard,
    borderColor: designColors.ground,
    backgroundColor: designColors.ground,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  payButtonNative: {
    minWidth: 160,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  payButtonPressed: {
    backgroundColor: designColors.ink,
  },
  payButtonDisabled: {
    opacity: 0.5,
    backgroundColor: designColors.ink,
  },
  payButtonText: {
    color: designColors.ink,
    fontSize: 14,
    fontFamily: interFonts.black,
    textTransform: "uppercase",
    letterSpacing: -0.28,
  },
  payButtonTextPressed: {
    color: designColors.ground,
  },
});

export function styleForCheckoutBarView0(arg0: number): DynamicStyle {
  return { paddingBottom: arg0 + 16 } as DynamicStyle;
}

export function styleForCheckoutBarButton0(canSubmit: boolean): DynamicStyle {
  return { pointerEvents: canSubmit ? "auto" : "none" } as DynamicStyle;
}
