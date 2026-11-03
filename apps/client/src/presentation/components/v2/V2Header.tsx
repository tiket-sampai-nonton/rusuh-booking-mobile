/**
 * RBT-096 — V2Header (Home Screen)
 *
 * MASTER-SPEC + 01-home.html:
 * - Fixed top, height 60px
 * - Logo: fontSize 18, fontWeight 900, uppercase
 * - Slide in from top on mount (translateY -100% → 0)
 * - border: 2px solid #000 (bottom only)
 * - Pure black/white, no shadows, no rounding
 *
 * Links (desktop > 720px): center nav links with hover underline slide
 * CTA: "Masuk / Daftar" black button with ink-spread hover
 */
import { useEffect, useMemo } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { v2Colors, v2Borders, v2Easing, v2Duration, v2Layout, interFonts } from '@presentation/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE = Easing.bezier(...v2Easing.primary);

export interface V2HeaderProps {
  /** Safe area top inset */
  readonly topInset?: number;
  /** Show center nav links (desktop only) */
  readonly showLinks?: boolean;
  /** Nav link data */
  readonly links?: readonly { label: string; testID?: string; onPress: () => void }[];
  /** CTA button press handler */
  readonly onCtaPress?: () => void;
  /** Logo press handler */
  readonly onLogoPress?: () => void;
  /** CTA label (default: "Masuk / Daftar") */
  readonly ctaLabel?: string;
}

/** Nav link with underline slide animation */
function V2NavLink({
  label,
  onPress,
  testID,
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly testID?: string;
}) {
  const reducedMotion = useReducedMotion();
  const hovered = useSharedValue(0);

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleX: hovered.value,
      },
    ],
    transformOrigin: hovered.value > 0.5 ? 'left' : 'right',
  }));

  const setHovered = (v: boolean) => {
    if (reducedMotion) {
      hovered.value = v ? 1 : 0;
      return;
    }
    hovered.value = withTiming(v ? 1 : 0, {
      duration: v2Duration.slow,
      easing: EASE,
    });
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${label} event`}
      testID={testID}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{ position: 'relative' }}
    >
      <Text
        style={{
          color: v2Colors.ink,
          fontSize: 14,
          fontFamily: interFonts.bold, // weight 700
          textTransform: 'uppercase',
          letterSpacing: 0.56, // 0.04em * 14
        }}
      >
        {label}
      </Text>
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: -2,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: v2Colors.ink,
          },
          underlineStyle,
        ]}
      />
    </AnimatedPressable>
  );
}

export function V2Header({
  topInset = 0,
  showLinks = false,
  links = [],
  onCtaPress,
  onLogoPress,
  ctaLabel = 'Masuk / Daftar',
}: V2HeaderProps) {
  const reducedMotion = useReducedMotion();
  const slideIn = useSharedValue(reducedMotion ? 1 : 0);
  const ctaHover = useSharedValue(0);

  // Slide in from top on mount (prototype: animation 0.8s, delay 0.5s)
  useEffect(() => {
    if (reducedMotion) {
      slideIn.value = 1;
      return;
    }
    const timeout = setTimeout(() => {
      slideIn.value = withTiming(1, {
        duration: 800,
        easing: EASE,
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [reducedMotion, slideIn]);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(slideIn.value, [0, 1], [-v2Layout.headerHeight - topInset, 0]),
      },
    ],
  }));

  const ctaFillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: `${(1 - ctaHover.value) * 100}%` as `${number}%`,
      },
    ],
  }));

  const ctaTextStyle = useAnimatedStyle(() => ({
    color:
      ctaHover.value > 0.5
        ? v2Colors.ink
        : v2Colors.ground,
  }));

  const setCtaHover = (v: boolean) => {
    if (reducedMotion) {
      ctaHover.value = v ? 1 : 0;
      return;
    }
    ctaHover.value = withTiming(v ? 1 : 0, {
      duration: v2Duration.slow,
      easing: EASE,
    });
  };

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }),
    [],
  );

  const innerStyle = useMemo<ViewStyle>(
    () => ({
      paddingTop: topInset,
      backgroundColor: v2Colors.ground,
      borderBottomWidth: v2Borders.standard,
      borderBottomColor: v2Colors.ink,
    }),
    [topInset],
  );

  const rowStyle = useMemo<ViewStyle>(
    () => ({
      height: v2Layout.headerHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    }),
    [],
  );

  return (
    <Animated.View style={[containerStyle, headerStyle]} pointerEvents="box-none">
      <View style={innerStyle}>
        <View style={rowStyle}>
          {/* Logo */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Rusuh Tiket home"
            onPress={onLogoPress}
            testID="header-logo"
          >
            <Text
              style={{
                color: v2Colors.ink,
                fontSize: 18,
                fontFamily: interFonts.black, // weight 900
                textTransform: 'uppercase',
                letterSpacing: 0.36, // 0.02em * 18
              }}
            >
              Rusuh Tiket
            </Text>
          </Pressable>

          {/* Center nav links (desktop only) */}
          {showLinks && links.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 24 }}>
              {links.map((l) => (
                <V2NavLink
                  key={l.label}
                  label={l.label}
                  onPress={l.onPress}
                  testID={l.testID}
                />
              ))}
            </View>
          )}

          {/* CTA button with ink spread hover (prototype .btn-ghost) */}
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
            testID="header-cta"
            onPress={onCtaPress}
            onHoverIn={() => setCtaHover(true)}
            onHoverOut={() => setCtaHover(false)}
            onPressIn={() => setCtaHover(true)}
            onPressOut={() => setCtaHover(false)}
            style={{
              borderWidth: v2Borders.standard,
              borderColor: v2Colors.ink,
              backgroundColor: v2Colors.ink,
              paddingVertical: 8,
              paddingHorizontal: 16,
              overflow: 'hidden',
            }}
          >
            {/* Fill layer for hover (slides from bottom → reveal ground) */}
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: v2Colors.ground,
                },
                ctaFillStyle,
              ]}
            />
            <Animated.Text
              style={[
                {
                  fontSize: 12,
                  fontFamily: interFonts.bold, // weight 700
                  textTransform: 'uppercase',
                  letterSpacing: 0.48, // 0.04em * 12
                },
                ctaTextStyle,
              ]}
            >
              {ctaLabel}
            </Animated.Text>
          </AnimatedPressable>
        </View>
      </View>
    </Animated.View>
  );
}

export default V2Header;
