import type { Animated } from "react-native";

import type { DynamicStyle } from "@presentation/utils/style";

export function lineupNativeCardAnimationStyle(
  opacity: Animated.Value,
  scale: Animated.Value,
): DynamicStyle {
  return {
    opacity,
    transform: [{ scale }],
  } as DynamicStyle;
}
