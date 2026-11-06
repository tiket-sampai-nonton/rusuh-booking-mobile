import { StyleSheet, type Animated } from "react-native";

import { designColors } from "@presentation/theme/event-design-tokens";
import type { DynamicStyle } from "@presentation/utils/style";

export const nativeCtaButtonStyles = StyleSheet.create({
  pressedButton: {
    backgroundColor: designColors.ground,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  pressedLabel: {
    color: designColors.ink,
  },
});

export function nativeCtaPulseStyle(
  scale: 1 | Animated.AnimatedInterpolation<string | number>,
): DynamicStyle {
  return { transform: [{ scale }] } as DynamicStyle;
}
