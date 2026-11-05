import type { Animated } from "react-native";

import type { DynamicStyle } from "@presentation/utils/style";

export function detailLoadingProgressStyle(progress: Animated.Value): DynamicStyle {
  return { transform: [{ translateX: progress }] } as DynamicStyle;
}
