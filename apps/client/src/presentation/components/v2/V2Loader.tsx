/**
 * V2Loader — Brutalist Mono loading overlay (RBT-087).
 *
 * Prototype loaders: an ink full-screen cover with a bouncing wordmark (home)
 * or a determinate progress bar (flow screens). This primitive renders an ink
 * overlay with the wordmark + an indeterminate bar that sweeps left→right.
 * Reanimated-driven; honors reduced-motion (static bar, no bounce/sweep).
 *
 * `visible` toggles it; when hidden it renders nothing (no layout cost).
 */
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { v2, v2Motion } from "@presentation/theme";

const EASE = Easing.bezier(...v2Motion.easeBezier);

export interface V2LoaderProps {
  readonly visible: boolean;
  /** Wordmark shown in the overlay (default "RUSUH"). */
  readonly label?: string;
  readonly testID?: string;
}

export function V2Loader({ visible, label = "RUSUH", testID }: V2LoaderProps) {
  const reduced = useReducedMotion();
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (!visible || reduced) {
      cancelAnimation(sweep);
      sweep.value = reduced ? 1 : 0;
      return;
    }
    sweep.value = 0;
    sweep.value = withRepeat(withTiming(1, { duration: 900, easing: EASE }), -1, false);
    return () => cancelAnimation(sweep);
  }, [visible, reduced, sweep]);

  const barStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "40%",
    backgroundColor: v2.ground,
    transform: [{ translateX: `${-40 + sweep.value * 250}%` as `${number}%` }],
  }));

  if (!visible) return null;

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel="Memuat"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: v2.ink,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <Text
        style={{ color: v2.ground, letterSpacing: 4 }}
        className="text-3xl font-v2 font-black uppercase"
      >
        {label}
      </Text>
      <View
        style={{
          marginTop: 24,
          width: 200,
          height: 4,
          backgroundColor: "rgba(255,255,255,0.2)",
          overflow: "hidden",
        }}
      >
        {reduced ? (
          <View style={{ width: "100%", height: "100%", backgroundColor: v2.ground }} />
        ) : (
          <Animated.View style={barStyle} />
        )}
      </View>
    </View>
  );
}
