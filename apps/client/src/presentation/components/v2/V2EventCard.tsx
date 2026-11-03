/**
 * RBT-096 — V2EventCard
 * RBT-097 — Mobile: stagger animation (FadeInUp.delay(index * 100))
 *
 * MASTER-SPEC §3.1 Event Card:
 * - Background: #fff
 * - Hover: translateY(-8px) rotateX(2deg), shadow
 * - Image: grayscale 100% → 0% on hover (CSS filter on web)
 * - Badge slides in from left on hover
 * - border: 2px solid #000
 * - Gap: 2px creates border effect (handled by parent grid)
 *
 * Mobile prototype v2-mobile/01-home.html:
 * - Stagger animation: cards reveal with delay(index * 100ms)
 * - Animation: fadeSlideUp 0.5s (opacity 0→1, translateY 20→0)
 *
 * Prototype .event-card styling:
 * - .event-image: aspect-ratio 4/3
 * - .event-badge: top:8, left:8, uppercase, bg ink
 * - .event-content: padding 24px (--space-m)
 * - .event-date: color muted, text-s
 * - .event-title: text-l, font-800, uppercase
 * - .event-venue: color muted, text-s
 * - .event-footer: border-top, price left, buy btn right
 */
import { useCallback, useEffect, useState } from 'react';
import { Image, Platform, Pressable, Text, View, type ImageStyle, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import type { EventSummary } from '@domain/repositories/event.repository';
import { badgeFor, type BadgeTone } from '@domain/rules/event-display';
import { eventImage } from '@domain/rules/event-image';
import { formatDateID } from '@domain/services/date-format';
import { minorToIDR } from '@domain/services/money';
import { v2Colors, v2Borders, v2Easing, v2Duration, v2SpacingSemantic, v2Shadows, interFonts } from '@presentation/theme';

const EASE = Easing.bezier(...v2Easing.primary);
const STAGGER_DELAY_MS = 100; // Mobile prototype: stagger 100ms per card
const isWeb = Platform.OS === 'web';

export interface V2EventCardProps {
  readonly event: EventSummary;
  readonly onPress: (eventId: string) => void;
  /** History/archive mode: dimmed, disabled */
  readonly history?: boolean;
  /** Index for stagger animation (mobile: delay(index * 100ms)) */
  readonly staggerIndex?: number;
}

/** Badge label per tone */
const BADGE_LABEL: Record<BadgeTone, string> = {
  ok: 'Tersedia',
  low: 'Stok Menipis',
  soon: 'Segera',
  soldout: 'Sold Out',
  done: 'Selesai',
};

export function V2EventCard({ event, onPress, history = false, staggerIndex = 0 }: V2EventCardProps) {
  const reducedMotion = useReducedMotion();
  const hovered = useSharedValue(0);
  const staggerOpacity = useSharedValue(reducedMotion ? 1 : 0);
  const staggerTranslateY = useSharedValue(reducedMotion ? 0 : 20);
  const [isHovered, setIsHovered] = useState(false); // For web CSS filter
  const badge = badgeFor(event);
  const disabled = badge.disabled || history;
  const dateTxt = formatDateID(event.startsAt);
  const image = eventImage(event.id);

  // Stagger animation on mount (mobile: FadeInUp.delay(index * 100))
  useEffect(() => {
    if (reducedMotion) {
      staggerOpacity.value = 1;
      staggerTranslateY.value = 0;
      return;
    }
    const delay = staggerIndex * STAGGER_DELAY_MS;
    staggerOpacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: EASE }));
    staggerTranslateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: EASE }));
  }, [reducedMotion, staggerIndex, staggerOpacity, staggerTranslateY]);

  const setHovered = useCallback(
    (v: boolean) => {
      if (disabled) return;
      setIsHovered(v); // For web CSS
      if (reducedMotion) {
        hovered.value = v ? 1 : 0;
        return;
      }
      hovered.value = withTiming(v ? 1 : 0, {
        duration: v2Duration.slow,
        easing: EASE,
      });
    },
    [disabled, reducedMotion, hovered],
  );

  // Card hover: translateY(-8px) rotateX(2deg) + shadow
  // Plus stagger animation for entry
  const cardStyle = useAnimatedStyle(() => ({
    opacity: staggerOpacity.value,
    transform: [
      { translateY: interpolate(hovered.value, [0, 1], [staggerTranslateY.value, -8]) },
      { perspective: 1000 },
      { rotateX: `${interpolate(hovered.value, [0, 1], [0, 2])}deg` },
    ],
    // React Native shadow (approximating hard offset)
    shadowColor: v2Colors.ink,
    shadowOffset: {
      width: interpolate(hovered.value, [0, 1], [0, v2Shadows.lg.x]),
      height: interpolate(hovered.value, [0, 1], [0, v2Shadows.lg.y]),
    },
    shadowOpacity: interpolate(hovered.value, [0, 1], [0, 0.15]),
    shadowRadius: 0,
    elevation: interpolate(hovered.value, [0, 1], [0, 8]),
    zIndex: hovered.value > 0.5 ? 10 : 0,
  }));

  // Image scale on hover: 1 → 1.05
  const imageScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(hovered.value, [0, 1], [1, 1.05]) }],
  }));

  // For native: grayscale overlay fades out on hover
  const nativeGrayscaleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(hovered.value, [0, 1], [0.7, 0]),
  }));

  // Badge slides in from left on hover (or always visible for certain states)
  const badgeAlwaysShow = badge.tone === 'soldout' || badge.tone === 'done' || badge.tone === 'low';
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: badgeAlwaysShow
          ? 0
          : interpolate(hovered.value, [0, 1], [-110, 0]),
      },
    ],
    opacity: badgeAlwaysShow ? 1 : hovered.value,
  }));

  // Title letter-spacing: 0 → 0.02em on hover
  const titleStyle = useAnimatedStyle(() => ({
    letterSpacing: interpolate(hovered.value, [0, 1], [-0.2, 0.4]),
  }));

  const containerStyle: ViewStyle = {
    backgroundColor: v2Colors.ground,
    opacity: disabled ? 0.62 : 1,
    borderWidth: 0, // Border comes from grid gap + ink background
  };

  const imageContainerStyle: ViewStyle = {
    aspectRatio: 4 / 3,
    overflow: 'hidden',
    position: 'relative',
  };

  // Web: use CSS filter for proper grayscale transition
  const webImageStyle: ImageStyle = isWeb
    ? {
        width: '100%',
        height: '100%',
        filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)',
        transition: 'filter 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
      } as any
    : {
        width: '100%',
        height: '100%',
      };

  const contentStyle: ViewStyle = {
    padding: v2SpacingSemantic.m,
  };

  const footerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: v2SpacingSemantic.s,
    borderTopWidth: v2Borders.standard,
    borderTopColor: v2Colors.ink,
    marginTop: v2SpacingSemantic.m,
  };

  return (
    <Animated.View style={[containerStyle, cardStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${event.name}, ${event.venue ?? ''}, ${dateTxt}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => onPress(event.id)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPressIn={() => setHovered(true)}
        onPressOut={() => setHovered(false)}
        testID={`v2-event-card-${event.id}`}
      >
        {/* Image with grayscale → color effect */}
        <View style={imageContainerStyle}>
          <Animated.View style={[{ flex: 1 }, imageScaleStyle]}>
            <Image
              source={{ uri: image }}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
              style={webImageStyle}
            />
          </Animated.View>

          {/* Native only: grayscale approximation overlay (fades out on hover) */}
          {!isWeb && (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#808080',
                },
                nativeGrayscaleStyle,
              ]}
            />
          )}

          {/* Badge */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: v2SpacingSemantic.s,
                left: v2SpacingSemantic.s,
                backgroundColor: badge.tone === 'soldout' ? v2Colors.danger : v2Colors.ink,
                paddingHorizontal: 10,
                paddingVertical: 4,
              },
              badgeStyle,
            ]}
          >
            <Text
              style={{
                color: v2Colors.ground,
                fontSize: 12,
                fontFamily: interFonts.bold, // weight 700
                textTransform: 'uppercase',
                letterSpacing: 0.48, // 0.04em
              }}
            >
              {badge.label || BADGE_LABEL[badge.tone]}
            </Text>
          </Animated.View>
        </View>

        {/* Content */}
        <View style={contentStyle}>
          {/* Date */}
          {dateTxt && (
            <Text
              style={{
                color: v2Colors.inkMuted,
                fontSize: 14,
                fontFamily: interFonts.medium, // weight 500
                marginBottom: 8,
              }}
            >
              {dateTxt}
            </Text>
          )}

          {/* Title */}
          <Animated.Text
            style={[
              {
                color: v2Colors.ink,
                fontSize: 20,
                fontFamily: interFonts.black, // weight 900 (prototype uses 800, closest is 900)
                textTransform: 'uppercase',
              },
              titleStyle,
            ]}
            numberOfLines={2}
          >
            {event.name}
          </Animated.Text>

          {/* Venue */}
          {event.venue && (
            <Text
              style={{
                color: v2Colors.inkMuted,
                fontSize: 14,
                fontFamily: interFonts.regular, // weight 400
                marginTop: 8,
              }}
              numberOfLines={1}
            >
              {event.venue}
            </Text>
          )}

          {/* Footer: price + buy button */}
          <View style={footerStyle}>
            <Text
              style={{
                color: v2Colors.ink,
                fontSize: 16,
                fontFamily: interFonts.black, // weight 900 (prototype uses 800)
              }}
            >
              {minorToIDR(event.minPriceMinor, { compact: true })}
            </Text>

            <View
              style={{
                backgroundColor: disabled ? v2Colors.inkMuted : v2Colors.ink,
                borderWidth: v2Borders.standard,
                borderColor: v2Colors.ink,
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  color: v2Colors.ground,
                  fontSize: 14,
                  fontFamily: interFonts.bold, // weight 700
                  textTransform: 'uppercase',
                  letterSpacing: 0.56,
                }}
              >
                {disabled ? 'Habis' : 'Beli'}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default V2EventCard;
