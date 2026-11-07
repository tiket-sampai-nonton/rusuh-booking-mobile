import type { Animated } from "react-native";

import type { DynamicStyle } from "@presentation/utils/style";

export function floatingCtaEntranceStyle(slide: Animated.Value): DynamicStyle {
  return { transform: [{ translateY: slide }] } as DynamicStyle;
}
