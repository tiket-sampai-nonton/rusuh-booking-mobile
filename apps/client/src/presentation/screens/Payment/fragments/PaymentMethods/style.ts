import { StyleSheet } from "react-native";
import { designColors, designBorders } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementBorderWidth0: {
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  elementColor1: {
    color: designColors.gray,
    letterSpacing: 2,
    borderBottomWidth: designBorders.standard,
    borderBottomColor: designColors.ink,
  },
  elementColor2: { color: designColors.ink },
  elementBackgroundColor3: { backgroundColor: designColors.ground },
  mobileWebContainer: { borderWidth: 1 },
});

export function styleForPaymentMethodsPressable0(arg0: boolean): DynamicStyle {
  return {
    borderWidth: designBorders.standard,
    borderColor: arg0 ? designColors.ember : designColors.ink,
    backgroundColor: arg0 ? designColors.accentDeep : designColors.ground,
  } as DynamicStyle;
}

export function styleForPaymentMethodsText1(arg0: boolean): DynamicStyle {
  return {
    color: arg0 ? designColors.ground : designColors.ink,
  } as DynamicStyle;
}

export function styleForPaymentMethodsText2(arg0: boolean): DynamicStyle {
  return {
    color: arg0 ? designColors.ground : designColors.inkMuted,
  } as DynamicStyle;
}

export function styleForPaymentMethodsView3(arg0: boolean): DynamicStyle {
  return {
    borderWidth: designBorders.standard,
    borderColor: arg0 ? designColors.ember : designColors.ink,
  } as DynamicStyle;
}
