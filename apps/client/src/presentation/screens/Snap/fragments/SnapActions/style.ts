import { StyleSheet } from "react-native";
import { designColors } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementLetterSpacing0: { letterSpacing: 0.5 },
  elementColor1: { color: designColors.ink, letterSpacing: 0.5 },
  elementColor2: { color: designColors.gray, letterSpacing: 0.5 },
  elementColor3: {
    color: designColors.inkMuted,
    borderTopWidth: 1,
    borderTopColor: designColors.field,
  },
});

export function styleForSnapActionsPressable0(arg0: {
  borderWidth: 2;
  opacity: number;
}): DynamicStyle {
  return {
    ...arg0,
    backgroundColor: designColors.success,
    borderColor: designColors.success,
  } as DynamicStyle;
}

export function styleForSnapActionsPressable1(arg0: {
  borderWidth: 2;
  opacity: number;
}): DynamicStyle {
  return {
    ...arg0,
    backgroundColor: designColors.ground,
    borderColor: designColors.ink,
  } as DynamicStyle;
}

export function styleForSnapActionsPressable2(arg0: {
  borderWidth: 2;
  opacity: number;
}): DynamicStyle {
  return {
    ...arg0,
    backgroundColor: designColors.ground,
    borderColor: designColors.ink,
  } as DynamicStyle;
}
