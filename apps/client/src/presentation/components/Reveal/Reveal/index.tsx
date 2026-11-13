import { useEffect } from "react";
import type { ReactNode } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { designEasing } from "@presentation/theme";

const EASE = Easing.bezier(...designEasing.primary);
const DURATION_MS = 600;
const DEFAULT_RISE = 40;

export interface RevealProps {
  readonly children: ReactNode;
  readonly delay?: number;
  readonly rise?: number;
  readonly testID?: string;
}

export function Reveal({
  children,
  delay = 0,
  rise = DEFAULT_RISE,
  testID,
}: RevealProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: DURATION_MS, easing: EASE }),
    );
  }, [reducedMotion, delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * rise }],
  }));

  return (
    <Animated.View style={animatedStyle} testID={testID}>
      {children}
    </Animated.View>
  );
}
