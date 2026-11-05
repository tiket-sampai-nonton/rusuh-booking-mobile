import { useEffect } from "react";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { splashLetterStyle } from "./style";

interface SplashLetterProps {
  readonly letter: string;
  readonly index: number;
  readonly reducedMotion: boolean;
}

export function SplashLetter({ letter, index, reducedMotion }: SplashLetterProps) {
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    progress.value = reducedMotion
      ? 1
      : withDelay(400 + index * 50, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [index, progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [24, 0]) }],
  }));

  return (
    <Animated.Text style={[splashLetterStyle(index), animatedStyle]}>
      {letter}
    </Animated.Text>
  );
}
