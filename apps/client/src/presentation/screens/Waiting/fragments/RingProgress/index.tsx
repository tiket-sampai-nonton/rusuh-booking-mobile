import type { ComponentType } from "react";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, type CircleProps } from "react-native-svg";

import { formatCount } from "../../display";
import {
  palette,
  RING_CIRCUMFERENCE,
  RING_RADIUS,
  RING_SIZE,
  RING_STROKE,
  styles,
} from "../../style";

type AnimatedCircleProps = CircleProps & {
  animatedProps?: Partial<Pick<CircleProps, "strokeDashoffset">>;
};

const AnimatedCircle = Animated.createAnimatedComponent(
  Circle,
) as unknown as ComponentType<AnimatedCircleProps>;

interface RingProgressProps {
  readonly progress: number; // 0..1
  readonly position: number;
  readonly isWarning?: boolean;
}

export function RingProgress({
  progress,
  position,
  isWarning = false,
}: RingProgressProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const reducedMotion = useReducedMotion() ?? false;
  const animatedProgress = useSharedValue(clamped);
  useEffect(() => {
    animatedProgress.value = reducedMotion
      ? clamped
      : withTiming(clamped, { duration: 700 });
  }, [animatedProgress, clamped, reducedMotion]);
  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - animatedProgress.value),
  }));
  const strokeColor =
    isWarning || position <= 10 ? palette.accent : palette.ink;

  return (
    <View style={styles.ringWrap} testID="waiting-ring">
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        style={styles.ringSvg}
      >
        {/* Background track */}
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={palette.ringBg}
          strokeWidth={RING_STROKE}
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth={RING_STROKE}
          strokeDasharray={RING_CIRCUMFERENCE}
          animatedProps={arcProps}
          strokeLinecap="square"
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text
          style={styles.position}
          testID="waiting-position"
          accessibilityLabel={`Posisi nomor ${position}`}
        >
          {formatCount(position)}
        </Text>
        <Text style={styles.positionLabel}>Posisi Anda</Text>
      </View>
    </View>
  );
}
