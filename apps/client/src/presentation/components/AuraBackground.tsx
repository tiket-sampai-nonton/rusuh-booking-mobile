/**
 * AuraBackground — the prototype's dark transactional backdrop.
 *
 * Deep-ink base with a diagonal red (or green on success) aura, matching the
 * `--ink` + radial-aura look of waiting.html / payment.html / success.html.
 * React Native has no radial gradient, so a diagonal LinearGradient over the
 * ink base approximates the prototype's aura closely. Tokens drive the colors
 * (no invented hex). Children render above the aura.
 */
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { brand, neutral, status } from "@presentation/theme";

export type AuraTone = "brand" | "success" | "error";

export interface AuraBackgroundProps {
  readonly tone?: AuraTone;
  readonly children: React.ReactNode;
  readonly testID?: string;
}

function auraColors(tone: AuraTone): readonly [string, string, string] {
  switch (tone) {
    case "success":
      return [status.ok, neutral.ink, neutral.ink];
    case "error":
      return [brand.redDeep, neutral.ink, neutral.ink];
    case "brand":
    default:
      return [brand.redDeep, neutral.ink, brand.ember];
  }
}

export function AuraBackground({
  tone = "brand",
  children,
  testID,
}: AuraBackgroundProps) {
  const [c0, c1, c2] = auraColors(tone);
  const reduced = useReducedMotion();
  // Prototype `.aura { animation: drift 20s ease-in-out infinite alternate }`:
  // a slow translate + scale + slight rotate. Honors reduced-motion (static).
  const drift = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    drift.value = withRepeat(
      withTiming(1, { duration: 20000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(drift);
  }, [reduced, drift]);
  const driftStyle = useAnimatedStyle(() => ({
    opacity: 0.55,
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [-10, 14]) },
      { translateY: interpolate(drift.value, [0, 1], [-8, 14]) },
      { scale: interpolate(drift.value, [0, 1], [1.05, 1.18]) },
      { rotate: `${interpolate(drift.value, [0, 1], [0, 5])}deg` },
    ],
  }));
  return (
    <View className="flex-1" style={{ backgroundColor: neutral.ink }} testID={testID}>
      <Animated.View
        pointerEvents="none"
        style={[{ position: "absolute", top: "-15%", left: "-15%", right: "-15%", bottom: "-15%" }, driftStyle]}
      >
        <LinearGradient
          // Diagonal aura: strong tint top-left, ink through the middle, a warm
          // ember glow bottom-right — the prototype's two-corner aura.
          colors={[c0, c1, c2]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      </Animated.View>
      <View className="flex-1">{children}</View>
    </View>
  );
}
