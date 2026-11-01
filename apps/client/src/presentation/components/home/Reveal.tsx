/**
 * Reveal — 1:1 of the prototype `.reveal`/`.reveal.in`: content starts
 * translated-down + transparent and animates up to rest (opacity + translateY
 * over .9s, the prototype's `--ease`). The prototype triggers on scroll-into-
 * view via IntersectionObserver; on a mobile scroll view a staggered mount
 * reveal is the faithful equivalent. Reduced-motion = instant (no transform).
 */
import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const EASE = Easing.bezier(0.32, 0.72, 0, 1);

export interface RevealProps {
  readonly children: React.ReactNode;
  /** Stagger in ms (prototype reveals cascade as they enter). */
  readonly delay?: number;
}

export function Reveal({ children, delay = 0 }: RevealProps) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      p.value = 1;
      return;
    }
    p.value = withDelay(delay, withTiming(1, { duration: 900, easing: EASE }));
  }, [reduced, delay, p]);

  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 40 }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
