import { useEffect, useMemo } from "react";
import { Text } from "react-native";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { designColors, designEasing } from "@presentation/theme";

import { toastBackgroundStyle, toastStyles } from "../style";
import type { ToastData } from "../types";

const EASE = Easing.bezier(...designEasing.out);
const ENTRANCE_DURATION_MS = 400;
const EXIT_DURATION_MS = 300;

interface ToastItemProps {
  readonly toast: ToastData;
  readonly onDismiss: () => void;
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const progress = useSharedValue(0);
  const backgroundColor = useMemo(() => {
    switch (toast.variant) {
      case "success":
        return designColors.success;
      case "error":
        return designColors.danger;
      default:
        return designColors.ink;
    }
  }, [toast.variant]);

  useEffect(() => {
    progress.value = withTiming(1, { duration: ENTRANCE_DURATION_MS, easing: EASE });

    if (toast.duration <= 0) return undefined;

    const timeout = setTimeout(() => {
      progress.value = withTiming(
        0,
        { duration: EXIT_DURATION_MS, easing: EASE },
        (finished) => {
          if (finished) runOnJS(onDismiss)();
        },
      );
    }, toast.duration);

    return () => clearTimeout(timeout);
    // The duration and callback belong to the mounted notification instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 100 }],
  }));

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[toastStyles.toast, toastBackgroundStyle(backgroundColor), animatedStyle]}
    >
      <Text style={toastStyles.message}>{toast.message}</Text>
    </Animated.View>
  );
}
