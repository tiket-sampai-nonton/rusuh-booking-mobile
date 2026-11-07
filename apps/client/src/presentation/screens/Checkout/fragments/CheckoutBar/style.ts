import { StyleSheet } from "react-native";
import {
  designColors,
  designBorders,
  plusJakartaSansFonts,
  withAlpha,
} from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: designColors.ink,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: designBorders.standard,
    borderTopColor: designColors.ground,
  },
  mobileWebContainer: {
    backgroundColor: designColors.ground,
    borderTopColor: designColors.ink,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  errorText: {
    color: designColors.danger,
    fontSize: 12,
    fontFamily: plusJakartaSansFonts.medium,
    textAlign: "center",
    marginBottom: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mobileWebContent: { gap: 12 },
  totalLabel: {
    color: withAlpha(designColors.ground, 0.5),
    fontSize: 10,
    fontFamily: plusJakartaSansFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  mobileWebTotalLabel: {
    color: designColors.gray,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  totalValue: {
    color: designColors.ground,
    fontSize: 20,
    fontFamily: plusJakartaSansFonts.extraBold,
    letterSpacing: -0.4,
  },
  mobileWebTotalValue: { color: designColors.ink, fontSize: 16 },
  payButton: {
    borderWidth: designBorders.standard,
    borderColor: designColors.danger,
    backgroundColor: designColors.danger,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  mobileWebPayButton: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: designColors.danger,
    borderColor: designColors.danger,
  },
  payButtonNative: {
    minWidth: 160,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  payButtonPressed: {
    backgroundColor: designColors.danger,
    borderColor: designColors.danger,
  },
  payButtonDisabled: {
    opacity: 0.5,
    backgroundColor: designColors.inkMuted,
    borderColor: designColors.inkMuted,
  },
  payButtonText: {
    color: designColors.ground,
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.extraBold,
    textTransform: "uppercase",
    letterSpacing: -0.28,
  },
  mobileWebPayButtonText: { color: designColors.ground, fontSize: 12 },
  payButtonTextPressed: {
    color: designColors.ground,
  },
});

export function styleForCheckoutBarView0(
  bottomInset: number,
  isMobileWeb = false,
): DynamicStyle {
  return {
    paddingBottom: bottomInset + (isMobileWeb ? 8 : 16),
    paddingTop: isMobileWeb ? 8 : 16,
    paddingHorizontal: isMobileWeb ? 16 : 20,
  } as DynamicStyle;
}

export function styleForCheckoutBarButton0(canSubmit: boolean): DynamicStyle {
  return { pointerEvents: canSubmit ? "auto" : "none" } as DynamicStyle;
}
