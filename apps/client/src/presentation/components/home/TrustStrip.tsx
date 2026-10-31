/**
 * TrustStrip — 1:1 of the prototype `.strip` (the ink bar of scrolling trust
 * items). Ink background, white/55 text, each item prefixed by a 5px red dot;
 * the track scrolls left forever (march2 30s). Reduced-motion = static.
 */
import { useEffect } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const ITEMS = [
  "Antrean adil FCFS",
  "Timer server-authoritative",
  "Anti-oversell",
  "Maks 3 tiket / NIK",
  "Pembayaran aman",
  "E-tiket instan",
] as const;

export function TrustStrip() {
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  // One copy's width ≈ screen width; scroll by that for a seamless loop.
  const span = Math.max(width, 393);

  useEffect(() => {
    if (reduced) return;
    x.value = withRepeat(
      withTiming(-span, { duration: 30000, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(x);
  }, [reduced, span, x]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View className="overflow-hidden bg-ink py-4.5" testID="trust-strip">
      <Animated.View style={[{ flexDirection: "row" }, style]}>
        {[0, 1].map((copy) => (
          <View key={copy} style={{ flexDirection: "row", width: span }}>
            {ITEMS.map((t) => (
              <View key={copy + t} className="flex-row items-center" style={{ marginRight: 46 }}>
                <View style={{ width: 5, height: 5, borderRadius: 999, marginRight: 12 }} className="bg-brand" />
                <Text className="text-base font-bold text-white/60">{t}</Text>
              </View>
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
