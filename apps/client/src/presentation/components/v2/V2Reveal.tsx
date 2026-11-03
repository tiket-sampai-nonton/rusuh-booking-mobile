/**
 * V2Reveal — section reveal + stagger primitive (RBT-087).
 *
 * Prototype `.reveal` / `.reveal-stagger`: content fades up (opacity 0→1,
 * translateY 40→0) when it enters the viewport. React Native has no cheap
 * IntersectionObserver, so the mount-reveal fires on mount with an optional
 * `delay` (compose a stagger by passing increasing delays to siblings, or wrap
 * a list in `V2RevealStagger` which spaces its children automatically).
 *
 * Reanimated-driven; honors reduced-motion (renders in place, no transform).
 */
import { Children, cloneElement, isValidElement, useEffect } from "react";
import type { ReactElement, ReactNode } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { v2Motion } from "@presentation/theme";

const EASE = Easing.bezier(...v2Motion.easeBezier);
const DURATION = 600;
const RISE = 40;

export interface V2RevealProps {
  readonly children: ReactNode;
  /** Entrance delay in ms (stagger). */
  readonly delay?: number;
  /** Vertical rise distance in px (default 40). */
  readonly rise?: number;
  readonly testID?: string;
}

export function V2Reveal({ children, delay = 0, rise = RISE, testID }: V2RevealProps) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      p.value = 1;
      return;
    }
    p.value = withDelay(delay, withTiming(1, { duration: DURATION, easing: EASE }));
  }, [reduced, delay, p]);

  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * rise }],
  }));

  return (
    <Animated.View style={style} testID={testID}>
      {children}
    </Animated.View>
  );
}

export interface V2RevealStaggerProps {
  readonly children: ReactNode;
  /** Gap between each child's entrance in ms (default 80, prototype value). */
  readonly step?: number;
  /** Base delay before the first child (ms). */
  readonly baseDelay?: number;
  readonly testID?: string;
}

/** Wraps each direct child in a {@link V2Reveal} with an increasing delay. */
export function V2RevealStagger({
  children,
  step = 80,
  baseDelay = 0,
  testID,
}: V2RevealStaggerProps) {
  const items = Children.toArray(children);
  return (
    <>
      {items.map((child, i) => {
        const key = isValidElement(child) ? ((child as ReactElement).key ?? i) : i;
        return (
          <V2Reveal
            key={key}
            delay={baseDelay + i * step}
            testID={testID ? `${testID}-${i}` : undefined}
          >
            {isValidElement(child) ? cloneElement(child as ReactElement) : child}
          </V2Reveal>
        );
      })}
    </>
  );
}
