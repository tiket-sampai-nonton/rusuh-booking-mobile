import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { EASE, SCROLL_INDICATOR_DELAY_MS } from "../../constants";
import {
  componentStyles,
  styleForScrollIndicatorAnimatedView10,
  styleForScrollIndicatorAnimatedView11,
} from "../../style";

export function ScrollIndicator() {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(0);

  // Fade in with 1.5s delay
  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1;
      return;
    }
    opacity.value = withDelay(
      SCROLL_INDICATOR_DELAY_MS,
      withTiming(1, { duration: 1000, easing: EASE }),
    );
  }, [reducedMotion, opacity]);

  // Scroll pulse animation: translateX -100% → 100% (1.5s infinite)
  useEffect(() => {
    if (reducedMotion) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [reducedMotion, pulse]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const lineStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(pulse.value, [0, 0.5, 1], [-40, 40, -40]) },
    ],
  }));

  return (
    <Animated.View
      style={[styleForScrollIndicatorAnimatedView10(), containerStyle]}
    >
      <View style={componentStyles.elementWidth31}>
        <Animated.View
          style={[styleForScrollIndicatorAnimatedView11(), lineStyle]}
        />
      </View>
    </Animated.View>
  );
}
