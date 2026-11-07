import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { styles } from "../../style";

type BadgeVariant =
  | "queue"
  | "yourTurn"
  | "soldOut"
  | "expired"
  | "offline"
  | "paused";

export function StatusBadge({
  variant,
  label,
}: {
  readonly variant: BadgeVariant;
  readonly label: string;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const opacity = useSharedValue(1);

  // Pulse animation for "queue" variant (prototype: animation: pulse 2s infinite)
  useEffect(() => {
    if (variant === "queue" && !reducedMotion) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1, // infinite
        false,
      );
    } else {
      opacity.value = 1;
    }
    return () => {
      cancelAnimation(opacity);
    };
  }, [variant, reducedMotion, opacity]);

  // Blink animation for "offline" variant (prototype: animation: blink 1s infinite)
  useEffect(() => {
    if (variant === "offline" && !reducedMotion) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 500 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
        false,
      );
    }
  }, [variant, reducedMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const badgeStyle = [
    styles.statusBadge,
    variant === "yourTurn" && styles.statusBadgeYourTurn,
    (variant === "soldOut" || variant === "expired") &&
      styles.statusBadgeSoldOut,
    (variant === "offline" || variant === "paused") &&
      styles.statusBadgeOffline,
  ];

  return (
    <Animated.View
      style={[badgeStyle, animatedStyle]}
      testID="waiting-status-badge"
    >
      <Text style={styles.statusBadgeText}>{label}</Text>
    </Animated.View>
  );
}
