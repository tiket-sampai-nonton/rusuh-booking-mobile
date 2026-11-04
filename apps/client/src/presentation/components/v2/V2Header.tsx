/**
 * RBT-096 — V2Header (Home Screen)
 * RBT-097 — Mobile height: 56px (vs 60px desktop)
 *
 * MASTER-SPEC + 01-home.html + v2-mobile/01-home.html:
 * - Fixed top, height 60px (desktop) / 56px (mobile)
 * - Logo: fontSize 18, fontWeight 900, uppercase
 * - Slide in from top on mount (translateY -100% → 0)
 * - border: 2px solid #000 (bottom only)
 * - Pure black/white, no shadows, no rounding
 *
 * Mobile differences (v2-mobile/01-home.html):
 * - Height: 56px (vs 60px desktop)
 * - Logo: 18px (1.125rem) same as desktop
 * - Icon actions use explicit SVG assets and 44px × 44px tap targets
 * - Active state: translate + shadow collapse, invert colors
 * - NO "Masuk / Daftar" text button on mobile — use icon buttons instead
 *
 * Links (desktop > 720px): center nav links with hover underline slide
 * CTA: "Masuk / Daftar" black button with ink-spread hover (desktop only)
 */
import { useEffect, useMemo } from 'react';
import { Platform, Pressable, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { v2Colors, v2Borders, v2Easing, v2Duration, v2Layout, interFonts } from '@presentation/theme';
import { useResponsive } from '@presentation/hooks/useResponsive';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE = Easing.bezier(...v2Easing.primary);

// ═══════════════════════════════════════════════════════════════════════════════
// ICON BUTTONS (v2-mobile/01-home.html: .icon-btn)
// 44px × 44px tap target, 2px border, 2px shadow, press: translate + invert
// ═══════════════════════════════════════════════════════════════════════════════

/** Login/user icon (person entering) */
function LoginIcon({ color = v2Colors.ink }: { readonly color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 17l5-5-5-5M15 12H3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

type HeaderIcon = 'login';

/** Mobile header icon button (v2-mobile .icon-btn) */
function IconButton({
  icon,
  label,
  onPress,
  testID,
}: {
  readonly icon: HeaderIcon;
  readonly label: string;
  readonly onPress?: () => void;
  readonly testID?: string;
}) {
  const reducedMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * 2 },
      { translateY: pressed.value * 2 },
    ],
    // Shadow collapses on press (2px → 0)
    // Web: use boxShadow; Native: use elevation approximation
  }));

  // Web shadow style (CSS boxShadow)
  const shadowStyle = useAnimatedStyle(() => {
    const shadowOffset = 2 - pressed.value * 2;
    if (Platform.OS === 'web') {
      return {
        boxShadow: `${shadowOffset}px ${shadowOffset}px 0 ${v2Colors.ink}`,
      } as any;
    }
    // Native: approximate with elevation (limited)
    return {
      elevation: pressed.value > 0.5 ? 0 : 2,
    };
  });

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: pressed.value > 0.5 ? v2Colors.ink : v2Colors.ground,
  }));

  const setPressed = (v: boolean) => {
    if (reducedMotion) {
      pressed.value = v ? 1 : 0;
      return;
    }
    pressed.value = withTiming(v ? 1 : 0, { duration: 150, easing: EASE });
  };

  const iconColor = pressed.value > 0.5 ? v2Colors.ground : v2Colors.ink;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        {
          width: v2Layout.tapTarget,
          height: v2Layout.tapTarget,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: v2Borders.standard,
          borderColor: v2Colors.ink,
        },
        buttonStyle,
        shadowStyle,
        bgStyle,
      ]}
    >
      {icon === 'login' ? <LoginIcon color={iconColor} /> : null}
    </AnimatedPressable>
  );
}

export interface V2HeaderProps {
  /** Safe area top inset */
  readonly topInset?: number;
  /** Show center nav links (desktop only) */
  readonly showLinks?: boolean;
  /** Nav link data */
  readonly links?: readonly { label: string; testID?: string; onPress: () => void }[];
  /** CTA button press handler (desktop: "Masuk / Daftar", mobile: login icon) */
  readonly onCtaPress?: () => void;
  /** Logo press handler */
  readonly onLogoPress?: () => void;
  /** CTA label (default: "Masuk / Daftar") — desktop only */
  readonly ctaLabel?: string;
  /** Whether user is logged in (mobile: hides login icon when true) */
  readonly isLoggedIn?: boolean;
  /** Screen-specific mobile actions. When provided, replaces the generic login action. */
  readonly actions?: readonly {
    icon: HeaderIcon;
    label: string;
    onPress?: () => void;
    testID?: string;
    count?: number;
  }[];
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
  isLoggedIn = false,
  actions = [],
}: V2HeaderProps) {
  const reducedMotion = useReducedMotion();
  const { headerHeight, isNative } = useResponsive();
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
        translateY: interpolate(slideIn.value, [0, 1], [-headerHeight - topInset, 0]),
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
      height: headerHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    }),
    [headerHeight],
  );

  return (
    <Animated.View style={[containerStyle, headerStyle]} pointerEvents="box-none">
      <View style={innerStyle}>
        <View style={rowStyle}>
          {/* Logo */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Beranda Rusuh Tiket"
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

          {/* Mobile native (not logged in): Login icon button */}
          {/* Mobile native (logged in): No CTA */}
          {/* Web: Always show text CTA button */}
          {isNative && actions.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {actions.map((action) => (
                <View key={action.testID ?? action.label} style={{ position: 'relative' }}>
                  <IconButton
                    icon={action.icon}
                    label={action.label}
                    onPress={action.onPress}
                    testID={action.testID}
                  />
                  {typeof action.count === 'number' && action.count > 0 ? (
                    <View
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        minWidth: 18,
                        height: 18,
                        paddingHorizontal: 3,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: v2Colors.danger,
                        borderRadius: 9,
                      }}
                    >
                      <Text style={{ color: v2Colors.ground, fontSize: 10, fontFamily: interFonts.bold }}>
                        {action.count > 99 ? '99+' : action.count}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ) : !isNative && !isLoggedIn ? (
            /* Desktop/Web: CTA button with ink spread hover (prototype .btn-ghost) */
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
          ) : null /* Mobile native + logged in = no CTA */}
        </View>
      </View>
    </Animated.View>
  );
}

export default V2Header;
