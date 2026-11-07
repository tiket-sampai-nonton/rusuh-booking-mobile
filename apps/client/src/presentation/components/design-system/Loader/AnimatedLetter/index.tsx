import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { loaderStyles } from "../style";

interface AnimatedLetterProps {
  readonly letter: string;
  readonly bounce: Animated.SharedValue<number>;
  readonly reducedMotion: boolean;
}

export function AnimatedLetter({
  letter,
  bounce,
  reducedMotion,
}: AnimatedLetterProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  if (reducedMotion) {
    return <Animated.Text style={loaderStyles.letter}>{letter}</Animated.Text>;
  }

  return (
    <Animated.Text style={[loaderStyles.letter, animatedStyle]}>
      {letter}
    </Animated.Text>
  );
}
