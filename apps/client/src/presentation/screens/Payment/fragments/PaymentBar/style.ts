import { StyleSheet } from "react-native";
import { designColors } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";
import { designBorder } from "@presentation/theme";

export const componentStyles = StyleSheet.create({
  elementColor0: { color: designColors.accent },
  elementColor1: { color: designColors.gray },
  elementColor2: { color: designColors.ink },
});

export function styleForPaymentBarView0(): DynamicStyle {
  return {
    borderTopWidth: designBorder.base,
    borderTopColor: designColors.accent,
  } as DynamicStyle;
}

export function styleForPaymentBarPressable1(arg0: boolean): DynamicStyle {
  return {
    backgroundColor: arg0 ? designColors.ground : designColors.inkMuted,
  } as DynamicStyle;
}

export function styleForPaymentBarText2(arg0: boolean): DynamicStyle {
  return {
    color: arg0 ? designColors.ink : designColors.ground,
    letterSpacing: 0.5,
  } as DynamicStyle;
}
