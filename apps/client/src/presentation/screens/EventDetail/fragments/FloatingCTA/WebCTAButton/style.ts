import type { Animated } from "react-native";
import { designColors, withAlpha } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export function webCtaPulseStyle(pulse: Animated.Value): DynamicStyle {
  return {
    boxShadow: pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [
        `0 0 0 0 ${withAlpha(designColors.ink, 0.3)}`,
        `0 0 20px 5px ${withAlpha(designColors.ink, 0.2)}`,
      ],
    }),
  } as unknown as DynamicStyle;
}
