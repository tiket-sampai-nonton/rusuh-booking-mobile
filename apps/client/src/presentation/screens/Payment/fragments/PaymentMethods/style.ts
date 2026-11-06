import { StyleSheet } from "react-native";
import { designColors, designBorder } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementBorderWidth0: {
    borderWidth: designBorder.base,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  elementColor1: {
    color: designColors.gray,
    letterSpacing: 2,
    borderBottomWidth: designBorder.base,
    borderBottomColor: designColors.ink,
  },
  elementColor2: { color: designColors.ground },
  elementBackgroundColor3: { backgroundColor: designColors.ground },
  mobileWebContainer: { borderWidth: 1 },
});

export function styleForPaymentMethodsPressable0(arg0: boolean): DynamicStyle {
  return {
    borderWidth: designBorder.base,
    borderColor: designColors.ink,
    backgroundColor: arg0 ? designColors.ink : designColors.ground,
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
    borderWidth: designBorder.base,
    borderColor: arg0 ? designColors.ground : designColors.ink,
  } as DynamicStyle;
}
