import type { Animated } from "react-native";

import type { DynamicStyle } from "@presentation/utils/style";

export function webCtaPulseStyle(pulse: Animated.Value): DynamicStyle {
  return {
    boxShadow: pulse.interpolate({
      inputRange: [0, 1],
      outputRange: ["0 0 0 0 rgba(0,0,0,0.3)", "0 0 20px 5px rgba(0,0,0,0.2)"],
    }),
  } as unknown as DynamicStyle;
}
