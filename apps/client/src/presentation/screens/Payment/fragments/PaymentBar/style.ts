import { StyleSheet } from "react-native";
import { designColors } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";
import { designBorder } from "@presentation/theme";

export const componentStyles = StyleSheet.create({
  elementColor0: { color: designColors.accent },
  elementColor1: { color: designColors.gray },
  elementColor2: { color: designColors.ink },
});

export function styleForPaymentBarView0(isMobileWeb = false): DynamicStyle {
  return {
    borderTopWidth: designBorder.base,
    borderTopColor: designColors.ink,
    ...(isMobileWeb && { paddingTop: 8 }),
  } as DynamicStyle;
}

export function styleForPaymentBarPressable1(
  canPay: boolean,
  isMobileWeb = false,
): DynamicStyle {
  return {
    backgroundColor: canPay ? designColors.danger : designColors.inkMuted,
    borderColor: canPay ? designColors.danger : designColors.inkMuted,
    minHeight: 48,
    paddingHorizontal: isMobileWeb ? 14 : 24,
    paddingVertical: isMobileWeb ? 10 : 14,
  } as DynamicStyle;
}

export function styleForPaymentBarText2(
  canPay: boolean,
  isMobileWeb = false,
): DynamicStyle {
  return {
    color: designColors.ground,
    letterSpacing: 0.5,
    fontSize: isMobileWeb ? 12 : 14,
  } as DynamicStyle;
}
