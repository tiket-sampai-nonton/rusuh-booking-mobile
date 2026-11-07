/**
 * RBT-096 — Input (Re-implementation)
 *
 * MASTER-SPEC §2.2:
 * - padding: 16px
 * - border: 2px solid the shared ink token
 * - fontSize: 16
 * - fontWeight: 500
 *
 * FOCUS STATE:
 * - boxShadow: 4px 4px 0 using the shared ink token
 * - transform: translate(-2px, -2px)
 *
 * VALID and error states use semantic success and danger tokens.
 */
import { forwardRef, useState, useCallback } from "react";
import type { TextInputProps } from "react-native";
import { TextInput, View, Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  designColors,
  designEasing,
  designDuration,
} from "@presentation/theme";
import { componentStyles } from "./style";
import {
  styleForComponentAnimatedView0,
  styleForComponentAnimatedTextInput1,
} from "./style";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const EASE = Easing.bezier(...designEasing.primary);
const DURATION = designDuration.normal; // 300ms

export type InputState = "default" | "valid" | "error";

export interface InputProps extends Omit<TextInputProps, "style"> {
  /** Validation state */
  readonly state?: InputState;
  /** Label above input */
  readonly label?: string;
  /** Error message below input */
  readonly error?: string;
  /** Hint text below input */
  readonly hint?: string;
  /** Test ID */
  readonly testID?: string;
}

/**
 * Get border color based on validation state.
 */
function getBorderColor(state: InputState): string {
  switch (state) {
    case "valid":
      return designColors.success;
    case "error":
      return designColors.danger;
    default:
      return designColors.ink;
  }
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { state = "default", label, error, hint, testID, onFocus, onBlur, ...props },
  ref,
) {
  const reducedMotion = useReducedMotion();
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      if (reducedMotion) {
        focusProgress.value = 1;
      } else {
        focusProgress.value = withTiming(1, {
          duration: DURATION,
          easing: EASE,
        });
      }
      onFocus?.(e);
    },
    [reducedMotion, focusProgress, onFocus],
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      if (reducedMotion) {
        focusProgress.value = 0;
      } else {
        focusProgress.value = withTiming(0, {
          duration: DURATION,
          easing: EASE,
        });
      }
      onBlur?.(e);
    },
    [reducedMotion, focusProgress, onBlur],
  );

  // Focus lift animation: translate(-2px, -2px)
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: focusProgress.value * -2 },
      { translateY: focusProgress.value * -2 },
    ],
  }));

  const borderColor = getBorderColor(state);

  // Show error message only when in error state
  const showError = state === "error" && error;
  const showHint = !showError && hint;

  return (
    <View style={componentStyles.elementGap0}>
      {/* Label */}
      {label && <Text style={componentStyles.elementFontSize1}>{label}</Text>}

      {/* Input container with shadow on focus */}
      <Animated.View
        style={[containerStyle, styleForComponentAnimatedView0(isFocused)]}
      >
        <AnimatedTextInput
          ref={ref}
          testID={testID}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={designColors.inkMuted}
          style={styleForComponentAnimatedTextInput1(borderColor)}
          {...props}
        />
      </Animated.View>

      {/* Error message */}
      {showError && (
        <Text style={componentStyles.elementFontSize2}>{error}</Text>
      )}

      {/* Hint text */}
      {showHint && <Text style={componentStyles.elementFontSize3}>{hint}</Text>}
    </View>
  );
});

export default Input;
