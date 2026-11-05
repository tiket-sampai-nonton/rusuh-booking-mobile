import { Animated } from "react-native";
import type { DynamicStyle } from "@presentation/utils/style";

export function styleForBlockAnimatedView0(arg0: Animated.Value, arg1: Animated.Value): DynamicStyle {
  return {
          opacity: arg0,
          transform: [{ translateY: arg1 }],
        } as DynamicStyle;
}
