import { useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { styleForPulsingDotAnimatedView5 } from "../../style";

export function PulsingDot() {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacityVal = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) return;
    // liveDot animation: scale 1 → 1.3, opacity 1 → 0.7 (1s infinite)
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    opacityVal.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacityVal);
    };
  }, [reducedMotion, scale, opacityVal]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacityVal.value,
  }));

  return (
    <Animated.View style={[styleForPulsingDotAnimatedView5(), dotStyle]} />
  );
}
