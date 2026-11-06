/**
 * RBT-096 — Header (Home Screen)
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
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import {
  designColors,
  designEasing,
  designDuration,
} from "@presentation/theme";
import { useResponsive } from "@presentation/hooks/useResponsive";
import {
  pointerEventsBoxNone,
  pointerEventsNone,
} from "@presentation/utils/style";
import { IconButton } from "./IconButton";
import { NavLink } from "./NavLink";
import type { HeaderAction } from "./types";
import {
  componentStyles,
  headerContainerStyle,
  headerInnerStyle,
  headerRowStyle,
} from "./style";
import {
  styleForHeaderAnimatedView2,
  styleForHeaderAnimatedText3,
} from "./style";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE = Easing.bezier(...designEasing.primary);

export interface HeaderProps {
  /** Safe area top inset */
  readonly topInset?: number;
  /** Show center nav links (desktop only) */
  readonly showLinks?: boolean;
  /** Nav link data */
  readonly links?: readonly {
    label: string;
    testID?: string;
    onPress: () => void;
  }[];
  /** CTA button press handler (desktop: "Masuk / Daftar", mobile: login icon) */
  readonly onCtaPress?: () => void;
  /** Logo press handler */
  readonly onLogoPress?: () => void;
  /** CTA label (default: "Masuk / Daftar") — desktop only */
  readonly ctaLabel?: string;
  /** Whether user is logged in (mobile: hides login icon when true) */
  readonly isLoggedIn?: boolean;
  /** Screen-specific mobile actions. When provided, replaces the generic login action. */
  readonly actions?: readonly HeaderAction[];
}

export function Header({
  topInset = 0,
  showLinks = false,
  links = [],
  onCtaPress,
  onLogoPress,
  ctaLabel = "Masuk / Daftar",
  isLoggedIn = false,
  actions = [],
}: HeaderProps) {
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
        translateY: interpolate(
          slideIn.value,
          [0, 1],
          [-headerHeight - topInset, 0],
        ),
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
    color: ctaHover.value > 0.5 ? designColors.ink : designColors.ground,
  }));

  const setCtaHover = (v: boolean) => {
    if (reducedMotion) {
      ctaHover.value = v ? 1 : 0;
      return;
    }
    ctaHover.value = withTiming(v ? 1 : 0, {
      duration: designDuration.slow,
      easing: EASE,
    });
  };

  const containerStyle = headerContainerStyle;
  const innerStyle = headerInnerStyle(topInset);
  const rowStyle = headerRowStyle(headerHeight);

  return (
    <Animated.View style={[containerStyle, headerStyle, pointerEventsBoxNone]}>
      <View style={innerStyle}>
        <View style={rowStyle}>
          {/* Logo */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Beranda Rusuh Tiket"
            onPress={onLogoPress}
            testID="header-logo"
          >
            <Text style={componentStyles.elementColor2}>Rusuh Tiket</Text>
          </Pressable>

          {/* Center nav links (desktop only) */}
          {showLinks && links.length > 0 && (
            <View style={componentStyles.elementFlexDirection3}>
              {links.map((l) => (
                <NavLink
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
          {isNative && actions.length > 0 && (
            <View style={componentStyles.elementFlexDirection4}>
              {actions.map((action) => (
                <View
                  key={action.testID ?? action.label}
                  style={componentStyles.elementPosition5}
                >
                  <IconButton
                    icon={action.icon}
                    label={action.label}
                    onPress={action.onPress}
                    testID={action.testID}
                  />
                  {typeof action.count === "number" && action.count > 0 && (
                    <View
                      style={[
                        componentStyles.elementPosition6,
                        pointerEventsNone,
                      ]}
                    >
                      <Text style={componentStyles.elementColor7}>
                        {formatActionCount(action.count)}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
          {!isNative && !isLoggedIn && (
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
              style={componentStyles.elementBorderWidth8}
            >
              {/* Fill layer for hover (slides from bottom → reveal ground) */}
              <Animated.View
                style={[
                  styleForHeaderAnimatedView2(),
                  ctaFillStyle,
                  pointerEventsNone,
                ]}
              />
              <Animated.Text
                style={[styleForHeaderAnimatedText3(), ctaTextStyle]}
              >
                {ctaLabel}
              </Animated.Text>
            </AnimatedPressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default Header;

function formatActionCount(count: number): string {
  if (count > 99) return "99+";
  return String(count);
}
