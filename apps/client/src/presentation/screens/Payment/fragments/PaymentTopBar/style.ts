import { StyleSheet } from "react-native";
import { designBorders, designColors } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";
export const componentStyles = StyleSheet.create({
  elementColor0: { color: designColors.ink },
});

export function styleForPaymentTopBarView0(): DynamicStyle {
  return {
    backgroundColor: designColors.ground,
    borderBottomWidth: designBorders.standard,
    borderBottomColor: designColors.ink,
  } as DynamicStyle;
}

export function styleForPaymentTopBarView1(_arg0: boolean): DynamicStyle {
  return {
    backgroundColor: designColors.danger,
  } as DynamicStyle;
}
