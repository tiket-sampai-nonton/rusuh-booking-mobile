/**
 * RBT-096 — V2Input (Re-implementation)
 *
 * MASTER-SPEC §2.2:
 * - padding: 16px
 * - border: 2px solid #000
 * - fontSize: 16
 * - fontWeight: 500
 *
 * FOCUS STATE:
 * - boxShadow: 4px 4px 0 #000
 * - transform: translate(-2px, -2px)
 *
 * VALID STATE: borderColor: #00aa00
 * ERROR STATE: borderColor: #ff0000
 */
import { forwardRef, useState, useCallback } from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput, View, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { v2Colors, v2Input, v2Borders, v2Easing, v2Duration, interFonts } from '@presentation/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const EASE = Easing.bezier(...v2Easing.primary);
const DURATION = v2Duration.normal; // 300ms

export type V2InputState = 'default' | 'valid' | 'error';

export interface V2InputProps extends Omit<TextInputProps, 'style'> {
  /** Validation state */
  readonly state?: V2InputState;
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
function getBorderColor(state: V2InputState): string {
  switch (state) {
    case 'valid':
      return v2Colors.success;
    case 'error':
      return v2Colors.danger;
    default:
      return v2Colors.ink;
  }
}

export const V2Input = forwardRef<TextInput, V2InputProps>(function V2Input(
  { state = 'default', label, error, hint, testID, onFocus, onBlur, ...props },
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
        focusProgress.value = withTiming(1, { duration: DURATION, easing: EASE });
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
        focusProgress.value = withTiming(0, { duration: DURATION, easing: EASE });
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
  const showError = state === 'error' && error;
  const showHint = !showError && hint;

  return (
    <View style={{ gap: 8 }}>
      {/* Label */}
      {label && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 12 * 0.1, // --tracking-wider
            color: v2Colors.ink,
            fontFamily: interFonts.regular,
          }}
        >
          {label}
        </Text>
      )}

      {/* Input container with shadow on focus */}
      <Animated.View
        style={[
          containerStyle,
          {
            // Shadow only when focused (4px 4px 0 #000)
            shadowColor: v2Colors.ink,
            shadowOffset: { width: isFocused ? 4 : 0, height: isFocused ? 4 : 0 },
            shadowOpacity: isFocused ? 1 : 0,
            shadowRadius: 0, // NO BLUR per MASTER-SPEC
            elevation: isFocused ? 4 : 0, // Android
          },
        ]}
      >
        <AnimatedTextInput
          ref={ref}
          testID={testID}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={v2Colors.inkMuted}
          style={{
            padding: v2Input.paddingY,
            borderWidth: v2Borders.standard,
            borderColor,
            backgroundColor: v2Colors.ground,
            fontSize: v2Input.fontSize,
            fontWeight: v2Input.fontWeight,
            color: v2Colors.ink,
            fontFamily: interFonts.regular,
          }}
          {...props}
        />
      </Animated.View>

      {/* Error message */}
      {showError && (
        <Text
          style={{
            fontSize: 12,
            color: v2Colors.danger,
            fontWeight: '600',
            fontFamily: interFonts.regular,
          }}
        >
          {error}
        </Text>
      )}

      {/* Hint text */}
      {showHint && (
        <Text
          style={{
            fontSize: 12,
            color: v2Colors.inkMuted,
            fontFamily: interFonts.regular,
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
});

export default V2Input;
