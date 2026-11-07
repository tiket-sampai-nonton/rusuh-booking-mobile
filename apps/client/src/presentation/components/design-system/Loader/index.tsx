/**
 * RBT-096 — Loader (Re-implementation)
 *
 * MASTER-SPEC §2.3:
 * - position: absolute, inset: 0
 * - background: shared ink token
 * - display: flex, center
 *
 * TEXT: white, fontSize 24-48, fontWeight 800, uppercase
 * Letter bounce animation: translateY 0 to -10px, 0.6s
 * Each letter delayed by 0.1s
 *
 * EXIT: clip-path inset animation (0 0 0 0 → 0 0 100% 0), 0.8s
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  runOnJS,
  makeMutable,
} from "react-native-reanimated";

import { AnimatedLetter } from "./AnimatedLetter";
import { ProgressBar } from "./ProgressBar";
import {
  LOADER_EASE,
  LOADER_EXIT_DURATION_MS,
  LOADER_LETTER_DELAY_MS,
  LOADER_LETTER_DURATION_MS,
  LOADER_MAX_LETTERS,
} from "./constants";
import { loaderStyles } from "./style";

// Maximum number of letters supported (fixed array size for hooks)
export interface LoaderProps {
  /** Whether the loader is visible */
  readonly visible: boolean;
  /** Wordmark text shown in the loader (default: "RUSUH") */
  readonly label?: string;
  /** Callback when exit animation completes */
  readonly onExitComplete?: () => void;
  /** Test ID */
  readonly testID?: string;
}

export function Loader({
  visible,
  label = "RUSUH",
  onExitComplete,
  testID,
}: LoaderProps) {
  const reducedMotion = useReducedMotion();
  const letters = useMemo(
    () => label.split("").slice(0, LOADER_MAX_LETTERS),
    [label],
  );
  const [hasExited, setHasExited] = useState(false);
  const exitCompleted = useRef(false);

  // Exit animation progress (0 = visible, 1 = exited)
  const exitProgress = useSharedValue(0);

  // Fixed array of letter bounce values (hooks must be called unconditionally)
  // Use useRef with makeMutable to avoid calling useSharedValue in a loop
  const letterBouncesRef = useRef<Animated.SharedValue<number>[] | null>(null);
  if (!letterBouncesRef.current) {
    letterBouncesRef.current = Array.from({ length: LOADER_MAX_LETTERS }, () =>
      makeMutable(0),
    );
  }
  const letterBounces = letterBouncesRef.current;

  // Track whether the loader has ever been visible (to prevent rendering when initially invisible)
  const hasBeenVisible = useRef(visible);

  const completeExit = useCallback(() => {
    if (exitCompleted.current) return;
    exitCompleted.current = true;
    setHasExited(true);
    onExitComplete?.();
  }, [onExitComplete]);

  // Start/stop letter animations based on visibility
  useEffect(() => {
    const letterCount = letters.length;

    if (!visible || reducedMotion) {
      // Stop all animations
      for (let i = 0; i < letterCount; i++) {
        cancelAnimation(letterBounces[i]);
        letterBounces[i].value = 0;
      }
      return;
    }

    // Start bouncing letters with stagger
    for (let i = 0; i < letterCount; i++) {
      letterBounces[i].value = withDelay(
        i * LOADER_LETTER_DELAY_MS,
        withRepeat(
          withSequence(
            withTiming(-10, {
              duration: LOADER_LETTER_DURATION_MS / 2,
              easing: LOADER_EASE,
            }),
            withTiming(0, {
              duration: LOADER_LETTER_DURATION_MS / 2,
              easing: LOADER_EASE,
            }),
          ),
          -1, // infinite
          false,
        ),
      );
    }

    return () => {
      for (let i = 0; i < letterCount; i++) {
        cancelAnimation(letterBounces[i]);
      }
    };
  }, [visible, reducedMotion, letters.length, letterBounces]);

  // Handle exit animation
  useEffect(() => {
    if (visible) {
      exitCompleted.current = false;
      exitProgress.value = 0;
      setHasExited(false);
      return;
    }

    if (reducedMotion) {
      exitProgress.value = 1;
      completeExit();
      return;
    }

    // Animate exit (clip-path effect simulated with translateY)
    exitProgress.value = withTiming(
      1,
      { duration: LOADER_EXIT_DURATION_MS, easing: LOADER_EASE },
      (finished) => {
        if (finished) {
          runOnJS(completeExit)();
        }
      },
    );
  }, [visible, reducedMotion, exitProgress, completeExit]);

  // Container exit animation (slide up)
  const containerStyle = useAnimatedStyle(() => ({
    opacity: 1 - exitProgress.value,
    transform: [
      { translateY: exitProgress.value * -100 }, // Slide up on exit
    ],
  }));

  // Don't render if not visible initially or fully exited
  if (!visible && !hasBeenVisible.current) {
    return null;
  }

  // Track if we've ever been visible
  if (visible) {
    hasBeenVisible.current = true;
  }

  // Don't render if fully exited after animation
  if (!visible && hasExited) {
    return null;
  }

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel="Memuat"
      style={[loaderStyles.container, containerStyle]}
    >
      {/* Bouncing letters */}
      <View style={loaderStyles.wordmark}>
        {letters.map((letter, index) => (
          <AnimatedLetter
            key={index}
            letter={letter}
            bounce={letterBounces[index]}
            reducedMotion={reducedMotion ?? false}
          />
        ))}
      </View>

      {/* Progress bar */}
      <View style={loaderStyles.progressTrack}>
        <ProgressBar reducedMotion={reducedMotion ?? false} visible={visible} />
      </View>
    </Animated.View>
  );
}

export default Loader;
