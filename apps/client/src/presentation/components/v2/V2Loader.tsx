/**
 * RBT-096 — V2Loader (Re-implementation)
 *
 * MASTER-SPEC §2.3:
 * - position: absolute, inset: 0
 * - background: #000
 * - display: flex, center
 *
 * TEXT: white, fontSize 24-48, fontWeight 900, uppercase
 * Letter bounce animation: translateY 0 to -10px, 0.6s
 * Each letter delayed by 0.1s
 *
 * EXIT: clip-path inset animation (0 0 0 0 → 0 0 100% 0), 0.8s
 */
import { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  Easing,
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
} from 'react-native-reanimated';

import { v2Colors, v2Easing, v2ZIndex, interFonts } from '@presentation/theme';

const EASE = Easing.bezier(...v2Easing.primary);
const LETTER_DURATION = 600; // 0.6s per letter bounce
const LETTER_DELAY = 100;    // 0.1s stagger
const EXIT_DURATION = 800;   // 0.8s exit

// Maximum number of letters supported (fixed array size for hooks)
const MAX_LETTERS = 10;

export interface V2LoaderProps {
  /** Whether the loader is visible */
  readonly visible: boolean;
  /** Wordmark text shown in the loader (default: "RUSUH") */
  readonly label?: string;
  /** Callback when exit animation completes */
  readonly onExitComplete?: () => void;
  /** Test ID */
  readonly testID?: string;
}

export function V2Loader({
  visible,
  label = 'RUSUH',
  onExitComplete,
  testID,
}: V2LoaderProps) {
  const reducedMotion = useReducedMotion();
  const letters = useMemo(() => label.split('').slice(0, MAX_LETTERS), [label]);

  // Exit animation progress (0 = visible, 1 = exited)
  const exitProgress = useSharedValue(0);

  // Fixed array of letter bounce values (hooks must be called unconditionally)
  // Use useRef with makeMutable to avoid calling useSharedValue in a loop
  const letterBouncesRef = useRef<Animated.SharedValue<number>[]>();
  if (!letterBouncesRef.current) {
    letterBouncesRef.current = Array.from({ length: MAX_LETTERS }, () => makeMutable(0));
  }
  const letterBounces = letterBouncesRef.current;

  // Track whether the loader has ever been visible (to prevent rendering when initially invisible)
  const hasBeenVisible = useRef(visible);

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
        i * LETTER_DELAY,
        withRepeat(
          withSequence(
            withTiming(-10, { duration: LETTER_DURATION / 2, easing: EASE }),
            withTiming(0, { duration: LETTER_DURATION / 2, easing: EASE }),
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
      exitProgress.value = 0;
      return;
    }

    if (reducedMotion) {
      exitProgress.value = 1;
      onExitComplete?.();
      return;
    }

    // Animate exit (clip-path effect simulated with translateY)
    exitProgress.value = withTiming(
      1,
      { duration: EXIT_DURATION, easing: EASE },
      (finished) => {
        if (finished && onExitComplete) {
          runOnJS(onExitComplete)();
        }
      },
    );
  }, [visible, reducedMotion, exitProgress, onExitComplete]);

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
  if (!visible && exitProgress.value >= 1) {
    return null;
  }

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel="Memuat"
      style={[styles.container, containerStyle]}
    >
      {/* Bouncing letters */}
      <View style={styles.wordmark}>
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
      <View style={styles.progressTrack}>
        <ProgressBar reducedMotion={reducedMotion ?? false} visible={visible} />
      </View>
    </Animated.View>
  );
}

/** Single animated letter */
function AnimatedLetter({
  letter,
  bounce,
  reducedMotion,
}: {
  letter: string;
  bounce: Animated.SharedValue<number>;
  reducedMotion: boolean;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  if (reducedMotion) {
    return <Text style={styles.letter}>{letter}</Text>;
  }

  return (
    <Animated.Text style={[styles.letter, style]}>
      {letter}
    </Animated.Text>
  );
}

/** Sweeping progress bar */
function ProgressBar({
  reducedMotion,
  visible,
}: {
  reducedMotion: boolean;
  visible: boolean;
}) {
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (!visible || reducedMotion) {
      cancelAnimation(sweep);
      sweep.value = reducedMotion ? 1 : 0;
      return;
    }

    sweep.value = 0;
    sweep.value = withRepeat(
      withTiming(1, { duration: 900, easing: EASE }),
      -1,
      false,
    );

    return () => cancelAnimation(sweep);
  }, [visible, reducedMotion, sweep]);

  const barStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: v2Colors.ground,
    transform: [
      { translateX: `${-40 + sweep.value * 250}%` as `${number}%` },
    ],
  }));

  if (reducedMotion) {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: v2Colors.ground,
        }}
      />
    );
  }

  return <Animated.View style={barStyle} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: v2Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: v2ZIndex.max,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letter: {
    color: v2Colors.ground,
    fontSize: 48,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 4,
    fontFamily: interFonts.black,
  },
  progressTrack: {
    marginTop: 24,
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
});

export default V2Loader;
