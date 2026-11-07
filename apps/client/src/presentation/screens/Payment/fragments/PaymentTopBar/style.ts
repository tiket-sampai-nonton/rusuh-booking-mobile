import { StyleSheet } from "react-native";
import { designColors } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";
import { designBorder } from "@presentation/theme";

export const componentStyles = StyleSheet.create({
  elementColor0: { color: designColors.ink },
});

export function styleForPaymentTopBarView0(): DynamicStyle {
  return {
    backgroundColor: designColors.ground,
    borderBottomWidth: designBorder.base,
    borderBottomColor: designColors.ink,
  } as DynamicStyle;
}

export function styleForPaymentTopBarView1(_arg0: boolean): DynamicStyle {
  return {
    backgroundColor: designColors.danger,
  } as DynamicStyle;
}
