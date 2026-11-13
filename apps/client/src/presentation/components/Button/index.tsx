/**
 * RBT-096 — Button (Re-implementation)
 *
 * MASTER-SPEC §2.1:
 * - padding: 10px 20px (default), 16px 32px (large)
 * - fontSize: 14 (default), 16 (large)
 * - fontWeight: 700
 * - textTransform: uppercase
 * - letterSpacing: 0.04em
 * - border: 2px solid the shared ink token
 *
 * GHOST: paper surface, ink text
 * GHOST hover: red fill from the bottom
 *
 * PRIMARY: red background with light text
 * PRIMARY hover: red-orange reveal with ink text
 */
import { useCallback } from "react";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  designColors,
  designButton,
  designEasing,
  designDuration,
} from "@presentation/theme";
import { pointerEventsNone } from "@presentation/utils/style";
import {
  styleForButtonPressable0,
  styleForButtonAnimatedView1,
  styleForButtonAnimatedText2,
  styleForButtonText3,
} from "./style";

const EASE = Easing.bezier(...designEasing.primary);
const DURATION = designDuration.slow; // 400ms for button fill per MASTER-SPEC

export type ButtonVariant = "primary" | "ghost" | "danger";

export interface ButtonProps {
  /** Button label text */
  readonly label: string;
  /** Press handler */
  readonly onPress?: () => void;
  /** Visual variant: primary (red), ghost (outlined), danger (semantic red) */
  readonly variant?: ButtonVariant;
  /** Disabled state */
  readonly disabled?: boolean;
  /** Large size: 16px 32px padding, 16px font */
  readonly large?: boolean;
  /** Test ID for testing */
  readonly testID?: string;
  /** Trailing element (e.g. arrow "→") */
  readonly trailing?: ReactNode;
}

/**
 * Get palette colors for each variant.
 * Returns: [baseBg, baseFg, fillColor, filledFg]
 */
function getPalette(variant: ButtonVariant) {
  switch (variant) {
    case "ghost":
      // Ghost: white surface → red fill from bottom
      return {
        bg: designColors.ground,
        fg: designColors.ink,
        fill: designColors.accent,
        filledFg: designColors.ground,
      };
    case "danger":
      // Danger: red bg → ink fill
      return {
        bg: designColors.danger,
        fg: designColors.ground,
        fill: designColors.ink,
        filledFg: designColors.ground,
      };
    case "primary":
    default:
      // Primary: red bg → red-orange reveal from top
      return {
        bg: designColors.accent,
        fg: designColors.ground,
        fill: designColors.ember,
        filledFg: designColors.ink,
      };
  }
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  large = false,
  testID,
  trailing,
}: ButtonProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0); // 0 = base, 1 = filled/hovered

  const palette = getPalette(variant);

  const setFilled = useCallback(
    (filled: boolean) => {
      if (disabled) return;

      if (reducedMotion) {
        // Instant change for reduced motion
        progress.value = filled ? 1 : 0;
        return;
      }

      progress.value = withTiming(filled ? 1 : 0, {
        duration: DURATION,
        easing: EASE,
      });
    },
    [disabled, reducedMotion, progress],
  );

  // Fill layer slides in from bottom (ghost) or top (primary)
  const fillDirection = variant === "primary" ? -1 : 1; // -1 = from top, 1 = from bottom

  const fillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          `${(1 - progress.value) * 100 * fillDirection}%` as `${number}%`,
      },
    ],
  }));

  // Label color interpolates between base and filled
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [palette.fg, palette.filledFg],
    ),
  }));

  // Padding based on size
  const paddingVertical = large
    ? designButton.paddingYLarge
    : designButton.paddingY;
  const paddingHorizontal = large
    ? designButton.paddingXLarge
    : designButton.paddingX;
  const fontSize = large ? designButton.fontSizeLarge : designButton.fontSize;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setFilled(true)}
      onPressOut={() => setFilled(false)}
      // Web hover handlers - only fire on web
      onHoverIn={() => setFilled(true)}
      onHoverOut={() => setFilled(false)}
      style={styleForButtonPressable0(
        palette,
        paddingVertical,
        paddingHorizontal,
        disabled,
      )}
    >
      {/* Fill layer */}
      <View
        style={[
          {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            overflow: "hidden",
          },
          pointerEventsNone,
        ]}
      >
        <Animated.View
          style={[
            styleForButtonAnimatedView1(palette),
            fillStyle,
            pointerEventsNone,
          ]}
        />
      </View>

      {/* Label */}
      <Animated.Text
        style={[labelStyle, styleForButtonAnimatedText2(fontSize, fontSize)]}
      >
        {label}
      </Animated.Text>

      {/* Trailing element */}
      {trailing != null && (
        <View style={pointerEventsNone}>
          {typeof trailing === "string" ? (
            <Text style={styleForButtonText3(palette, fontSize)}>
              {trailing}
            </Text>
          ) : (
            trailing
          )}
        </View>
      )}
    </Pressable>
  );
}

export default Button;
