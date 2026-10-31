/**
 * ScreenFade — a gentle mount transition wrapper for every screen.
 *
 * On mount the content fades in (opacity 0→1) and settles up a few px
 * (translateY 10→0) over ~380ms with the app's standard ease. This gives each
 * route a soft "fade in / fade out" feel as the router swaps screens (expo-
 * router unmounts the old screen and mounts the new one, so a mount-fade reads
 * as a crossfade between them).
 *
 * Platform-safe: identical on native and web. Honors reduced-motion (renders
 * instantly, no transform). Purely presentational — wraps `children` in a
 * flex-1 Animated.View so it never changes layout.
 */
import { useEffect } from "react";
import type { ReactNode } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const EASE = Easing.bezier(0.32, 0.72, 0, 1);

export interface ScreenFadeProps {
  readonly children: ReactNode;
  /** Optional entrance delay in ms (stagger when composing). */
  readonly delay?: number;
}

export function ScreenFade({ children, delay = 0 }: ScreenFadeProps) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      p.value = 1;
      return;
    }
    p.value = withTiming(1, { duration: 380, easing: EASE });
  }, [reduced, p]);

  const style = useAnimatedStyle(() => ({
    flex: 1,
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 10 }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
