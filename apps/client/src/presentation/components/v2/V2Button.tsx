/**
 * RBT-096 — V2Button (Re-implementation)
 *
 * MASTER-SPEC §2.1:
 * - padding: 10px 20px (default), 16px 32px (large)
 * - fontSize: 14 (default), 16 (large)
 * - fontWeight: 700
 * - textTransform: uppercase
 * - letterSpacing: 0.04em
 * - border: 2px solid #000
 *
 * GHOST: bg transparent, text #000
 * GHOST hover: bg #000, text #fff (fill animation from bottom)
 *
 * PRIMARY: bg #000, text #fff
 * PRIMARY hover: bg #fff, text #000 (reveal animation from top)
 */
import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { v2Colors, v2Button, v2Borders, v2Easing, v2Duration, interFonts } from '@presentation/theme';

const EASE = Easing.bezier(...v2Easing.primary);
const DURATION = v2Duration.slow; // 400ms for button fill per MASTER-SPEC

export type V2ButtonVariant = 'primary' | 'ghost' | 'danger';

export interface V2ButtonProps {
  /** Button label text */
  readonly label: string;
  /** Press handler */
  readonly onPress?: () => void;
  /** Visual variant: primary (black bg), ghost (transparent bg), danger (red bg) */
  readonly variant?: V2ButtonVariant;
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
function getPalette(variant: V2ButtonVariant) {
  switch (variant) {
    case 'ghost':
      // Ghost: transparent → ink fill from bottom
      return {
        bg: v2Colors.ground,
        fg: v2Colors.ink,
        fill: v2Colors.ink,
        filledFg: v2Colors.ground,
      };
    case 'danger':
      // Danger: red bg → ink fill
      return {
        bg: v2Colors.danger,
        fg: v2Colors.ground,
        fill: v2Colors.ink,
        filledFg: v2Colors.ground,
      };
    case 'primary':
    default:
      // Primary: ink bg → ground reveal from top
      return {
        bg: v2Colors.ink,
        fg: v2Colors.ground,
        fill: v2Colors.ground,
        filledFg: v2Colors.ink,
      };
  }
}

export function V2Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  large = false,
  testID,
  trailing,
}: V2ButtonProps) {
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
  const fillDirection = variant === 'primary' ? -1 : 1; // -1 = from top, 1 = from bottom

  const fillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: `${(1 - progress.value) * 100 * fillDirection}%` as `${number}%`,
      },
    ],
  }));

  // Label color interpolates between base and filled
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [palette.fg, palette.filledFg]),
  }));

  // Padding based on size
  const paddingVertical = large ? v2Button.paddingYLarge : v2Button.paddingY;
  const paddingHorizontal = large ? v2Button.paddingXLarge : v2Button.paddingX;
  const fontSize = large ? v2Button.fontSizeLarge : v2Button.fontSize;

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
      style={{
        borderWidth: v2Borders.standard,
        borderColor: v2Colors.ink,
        backgroundColor: palette.bg,
        paddingVertical,
        paddingHorizontal,
        overflow: 'hidden',
        opacity: disabled ? 0.5 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {/* Fill layer */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: palette.fill,
          },
          fillStyle,
        ]}
      />

      {/* Label */}
      <Animated.Text
        style={[
          labelStyle,
          {
            fontSize,
            fontWeight: v2Button.fontWeight,
            textTransform: 'uppercase',
            letterSpacing: fontSize * v2Button.letterSpacing,
            fontFamily: interFonts.bold,
          },
        ]}
      >
        {label}
      </Animated.Text>

      {/* Trailing element */}
      {trailing != null && (
        <View pointerEvents="none">
          {typeof trailing === 'string' ? (
            <Text
              style={{
                color: palette.fg,
                fontSize,
                fontWeight: v2Button.fontWeight,
                fontFamily: interFonts.bold,
              }}
            >
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

export default V2Button;
