/** Prototype `.check` — 84px green circle with a pop-in (reduced-motion safe). */
import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { successStyles } from "../style";

export function SuccessCheck() {
  const reduced = useReducedMotion();
  const s = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    s.value = withSequence(
      withTiming(1.12, { duration: 360, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 240, easing: Easing.inOut(Easing.ease) }),
    );
  }, [reduced, s]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: s.value }],
    opacity: s.value === 0 ? 0 : 1,
  }));
  return (
    <Animated.View style={[successStyles.check, style]}>
      <Text style={successStyles.checkMark} accessibilityElementsHidden>✓</Text>
    </Animated.View>
  );
}
