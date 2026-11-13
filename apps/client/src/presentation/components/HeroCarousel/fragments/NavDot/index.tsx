import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { SLIDE_DURATION_MS } from "../../constants";
import {
  styleForNavDotAnimatedView8,
  styleForNavDotAnimatedView9,
  styleForNavDotPressable7,
} from "../../style";

export function NavDot({
  isActive,
  onPress,
  index,
}: {
  readonly isActive: boolean;
  readonly onPress: () => void;
  readonly index: number;
}) {
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  // Progress animation: scaleX 0 → 1 (6s linear)
  useEffect(() => {
    if (!isActive) {
      progress.value = 0;
      return;
    }
    if (reducedMotion) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: SLIDE_DURATION_MS,
      easing: Easing.linear,
    });
  }, [isActive, reducedMotion, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`Slide ${index + 1}`}
      onPress={onPress}
      style={styleForNavDotPressable7(isActive)}
    >
      {/* Fill (slides in on active) */}
      <Animated.View
        style={[
          styleForNavDotAnimatedView8(),
          isActive ? progressStyle : styleForNavDotAnimatedView9(),
        ]}
      />
    </Pressable>
  );
}
