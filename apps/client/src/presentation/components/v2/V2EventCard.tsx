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
 * Mobile prototype v2-mobile/01-home.html differences:
 * - Card: always has 4px 4px hard shadow
 * - Content padding: --space-s (16px) not --space-m (24px)
 * - Date: 12px, uppercase, letter-spacing 0.05em
 * - Title: 16px, weight 700, NOT uppercase, line-height 1.3
 * - Venue: 12px with icon
 * - Footer: 1px dashed border (not 2px solid), 32x32 icon btn
 * - Badge: 10px, red bg (danger)
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
import Svg, { Path } from 'react-native-svg';

import type { EventSummary } from '@domain/repositories/event.repository';
import { badgeFor, type BadgeTone } from '@domain/rules/event-display';
import { eventImage } from '@domain/rules/event-image';
import { formatDateID } from '@domain/services/date-format';
import { minorToIDR } from '@domain/services/money';
import { v2Colors, v2Borders, v2Easing, v2Duration, v2SpacingSemantic, v2Shadows, interFonts } from '@presentation/theme';
import { useResponsive } from '@presentation/hooks/useResponsive';

const EASE = Easing.bezier(...v2Easing.primary);
const STAGGER_DELAY_MS = 100; // Mobile prototype: stagger 100ms per card
const isWeb = Platform.OS === 'web';

// Mobile design tokens (v2-mobile/design-tokens.css)
const MOBILE_CONTENT_PADDING = 16; // --space-s
const MOBILE_DATE_SIZE = 12;       // --text-xs
const MOBILE_TITLE_SIZE = 16;      // --text-m
const MOBILE_VENUE_SIZE = 12;      // --text-xs
const MOBILE_BADGE_SIZE = 10;
const MOBILE_ACTION_SIZE = 32;

// Desktop design tokens
const DESKTOP_CONTENT_PADDING = v2SpacingSemantic.m; // 24px
const DESKTOP_DATE_SIZE = 14;      // --text-s
const DESKTOP_TITLE_SIZE = 20;     // --text-l
const DESKTOP_VENUE_SIZE = 14;     // --text-s

/** Map pin icon (12x12) for mobile venue */
function MapPinIconSmall({ color = v2Colors.inkMuted }: { readonly color?: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

/** Arrow icon (16x16) for mobile action button */
function ArrowRightIcon({ color = v2Colors.ink }: { readonly color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={2.5} />
    </Svg>
  );
}

export interface V2EventCardProps {
  readonly event: EventSummary;
  readonly onPress: (eventId: string) => void;
  /** History/archive mode: dimmed, disabled */
  readonly history?: boolean;
  /** Index for stagger animation (mobile: delay(index * 100ms)) */
  readonly staggerIndex?: number;
  /** List view mode: use 16:9 aspect ratio instead of 1:1 */
  readonly listMode?: boolean;
  /** Native Home carousel: reveal the color layer when the card enters view. */
  readonly isImageVisible?: boolean;
}

/** Badge label per tone */
const BADGE_LABEL: Record<BadgeTone, string> = {
  ok: 'Tersedia',
  low: 'Stok Menipis',
  soon: 'Segera',
  soldout: 'Sold Out',
  done: 'Selesai',
};

export function V2EventCard({ event, onPress, history = false, staggerIndex = 0, listMode = false, isImageVisible = true }: V2EventCardProps) {
  const reducedMotion = useReducedMotion();
  const { isNative } = useResponsive();
  const hovered = useSharedValue(0);
  const colorReveal = useSharedValue(isNative ? 0 : 1);
  const staggerOpacity = useSharedValue(reducedMotion ? 1 : 0);
  const staggerTranslateY = useSharedValue(reducedMotion ? 0 : 20);
  const [isHovered, setIsHovered] = useState(false); // For web CSS filter
  const badge = badgeFor(event);
  const disabled = badge.disabled || history;
  const dateTxt = formatDateID(event.startsAt);
  const image = eventImage(event.id);
  const grayscaleImage = image.includes('images.unsplash.com') ? `${image}${image.includes('?') ? '&' : '?'}sat=-100` : image;

  useEffect(() => {
    if (!isNative) return;
    colorReveal.value = isImageVisible && !reducedMotion ? withTiming(1, { duration: 900, easing: EASE }) : (isImageVisible ? 1 : 0);
  }, [colorReveal, isImageVisible, isNative, reducedMotion]);
  const colorLayerStyle = useAnimatedStyle(() => ({ opacity: colorReveal.value }));

  // Mobile vs Desktop sizing
  const contentPadding = isNative ? MOBILE_CONTENT_PADDING : DESKTOP_CONTENT_PADDING;
  const dateSize = isNative ? MOBILE_DATE_SIZE : DESKTOP_DATE_SIZE;
  const titleSize = isNative ? MOBILE_TITLE_SIZE : DESKTOP_TITLE_SIZE;
  const venueSize = isNative ? MOBILE_VENUE_SIZE : DESKTOP_VENUE_SIZE;

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
  // Mobile: always has 4px 4px shadow (no hover transform, but press feedback)
  // Plus stagger animation for entry
  // Note: Shadow properties are set in containerStyle for native to avoid NOBRIDGE errors
  const cardStyle = useAnimatedStyle(() => ({
    opacity: staggerOpacity.value,
    transform: isNative
      ? [
          // Mobile: press feedback (translate down on press)
          { translateY: staggerTranslateY.value + interpolate(hovered.value, [0, 1], [0, 4]) },
        ]
      : [
          // Desktop: hover lift
          { translateY: interpolate(hovered.value, [0, 1], [staggerTranslateY.value, -8]) },
          { perspective: 1000 },
          { rotateX: `${interpolate(hovered.value, [0, 1], [0, 2])}deg` },
        ],
    // Web only: animate shadow (native shadow is static in containerStyle)
    ...(isWeb ? {
      shadowColor: v2Colors.ink,
      shadowOffset: {
        width: interpolate(hovered.value, [0, 1], [0, v2Shadows.lg.x]),
        height: interpolate(hovered.value, [0, 1], [0, v2Shadows.lg.y]),
      },
      shadowOpacity: interpolate(hovered.value, [0, 1], [0, 0.15]),
      shadowRadius: 0,
      elevation: interpolate(hovered.value, [0, 1], [0, 8]),
    } : {}),
  }));

  // Image scale on hover: 1 → 1.05
  const imageScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(hovered.value, [0, 1], [1, 1.05]) }],
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
    position: 'relative',
    zIndex: isHovered ? 10 : 0,
    opacity: disabled ? 0.62 : 1,
    // Mobile: explicit 2px solid border (prototype has border: var(--border))
    // Desktop: border comes from grid gap + ink background
    borderWidth: isNative ? v2Borders.standard : 0,
    borderColor: isNative ? v2Colors.ink : undefined,
    // Mobile: static shadow (4px 4px) to avoid NOBRIDGE errors with animated shadowOffset
    ...(isNative ? {
      shadowColor: v2Colors.ink,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    } : {}),
  };

  const imageContainerStyle: ViewStyle = {
    // Mobile grid: square aspect ratio (1:1) for taller image
    // Mobile list: 16:9 aspect ratio for shorter image
    // Desktop: 4:3 aspect ratio
    aspectRatio: isNative ? (listMode ? 16 / 9 : 1) : (listMode ? undefined : 4 / 3),
    width: isWeb && listMode ? 240 : '100%',
    height: isWeb && listMode ? 160 : undefined,
    flexShrink: 0,
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
    padding: contentPadding,
    // Mobile: fixed height content area for consistent card heights
    // Date (16) + gap (4) + Title (2 lines * 16 * 1.3 = 42) + gap (8) + Venue (12) + gap (16) + Footer (~50) ≈ 148
    minHeight: isNative ? 160 : undefined,
    justifyContent: isNative ? 'space-between' : undefined,
    ...(isWeb && listMode ? { flex: 1, minHeight: 160, justifyContent: 'center' } : {}),
  };

  const footerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: v2SpacingSemantic.s,
    borderTopWidth: isNative ? 1 : v2Borders.standard, // Mobile: 1px, Desktop: 2px
    borderStyle: isNative ? 'dashed' : 'solid', // Mobile: dashed, Desktop: solid
    borderTopColor: v2Colors.ink,
    marginTop: isNative ? v2SpacingSemantic.s : v2SpacingSemantic.m,
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
        style={isWeb && listMode ? { flexDirection: 'row', minHeight: 160, borderWidth: v2Borders.standard, borderColor: v2Colors.ink, backgroundColor: v2Colors.ground } : undefined}
      >
        {/* Image with grayscale → color effect */}
        <View style={imageContainerStyle}>
          <Animated.View style={[{ flex: 1 }, imageScaleStyle]}>
            <Image
              source={{ uri: isNative ? grayscaleImage : image }}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
              style={webImageStyle}
            />
            {isNative ? (
              <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: '100%', height: '100%' }, colorLayerStyle]}>
                <Image source={{ uri: image }} resizeMode="cover" accessibilityIgnoresInvertColors style={{ width: '100%', height: '100%' }} />
              </Animated.View>
            ) : null}
          </Animated.View>


          {/* Badge */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: v2SpacingSemantic.xs,
                left: v2SpacingSemantic.xs,
                // Mobile: red bg (danger), Desktop: black bg (ink) unless soldout
                backgroundColor: isNative ? v2Colors.danger : (badge.tone === 'soldout' ? v2Colors.danger : v2Colors.ink),
                paddingHorizontal: isNative ? 8 : 10, // Mobile: 0.5rem = 8px
                paddingVertical: isNative ? 4 : 4,    // Mobile: 0.25rem = 4px
              },
              badgeStyle,
            ]}
          >
            <Text
              style={{
                color: v2Colors.ground,
                fontSize: isNative ? MOBILE_BADGE_SIZE : 12, // Mobile: 10px
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
          {/* Top section: date, title, venue */}
          <View>
            {/* Date: Mobile: 12px uppercase, Desktop: 14px */}
            {dateTxt && (
              <Text
                style={{
                  color: v2Colors.inkMuted,
                  fontSize: dateSize,
                  fontFamily: interFonts.medium, // weight 500
                  textTransform: isNative ? 'uppercase' : 'none', // Mobile: uppercase
                  letterSpacing: isNative ? 0.6 : 0, // Mobile: 0.05em at 12px
                  marginBottom: isNative ? 4 : 8, // Mobile: 0.25rem = 4px
                }}
              >
                {dateTxt}
              </Text>
            )}

            {/* Title: Mobile: 16px weight 700 not-uppercase, Desktop: 20px weight 900 uppercase */}
            <Animated.Text
              style={[
                {
                  color: v2Colors.ink,
                  fontSize: titleSize,
                  fontFamily: isNative ? interFonts.bold : interFonts.black, // Mobile: 700, Desktop: 900
                  textTransform: isNative ? 'none' : 'uppercase', // Mobile: NOT uppercase
                  lineHeight: isNative ? titleSize * 1.3 : undefined, // Mobile: line-height 1.3
                  // Mobile: fixed height for 2 lines to ensure consistent card height
                  height: isNative ? titleSize * 1.3 * 2 : undefined,
                },
                !isNative && titleStyle, // Desktop: hover letter-spacing animation
              ]}
              numberOfLines={2}
            >
              {event.name}
            </Animated.Text>

            {/* Venue: Mobile: 12px with icon, Desktop: 14px text only */}
            {event.venue && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: isNative ? 4 : 0, // Mobile: 0.25rem gap for icon
                  marginTop: 8,
                }}
              >
                {isNative && <MapPinIconSmall color={v2Colors.inkMuted} />}
                <Text
                  style={{
                    color: v2Colors.inkMuted,
                    fontSize: venueSize,
                    fontFamily: interFonts.regular, // weight 400
                  }}
                  numberOfLines={1}
                >
                  {event.venue}
                </Text>
              </View>
            )}
          </View>

          {/* Footer: price + action */}
          <View style={footerStyle}>
            {/* Price: Mobile shows "Mulai dari" subtext */}
            <View>
              {isNative && (
                <Text
                  style={{
                    color: v2Colors.inkMuted,
                    fontSize: MOBILE_VENUE_SIZE,
                    fontFamily: interFonts.regular,
                  }}
                >
                  Mulai dari
                </Text>
              )}
              <Text
                style={{
                  color: v2Colors.ink,
                  fontSize: isNative ? 14 : 16,
                  fontFamily: interFonts.bold, // Mobile: 700, Desktop: similar
                }}
              >
                {minorToIDR(event.minPriceMinor, { compact: true })}
              </Text>
            </View>

            {/* Action: Mobile: 32x32 icon button, Desktop: text button */}
            {isNative ? (
              // Mobile: 32x32 icon box
              <View
                style={{
                  width: MOBILE_ACTION_SIZE,
                  height: MOBILE_ACTION_SIZE,
                  borderWidth: v2Borders.standard,
                  borderColor: v2Colors.ink,
                  backgroundColor: disabled ? v2Colors.inkMuted : v2Colors.ground,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowRightIcon color={disabled ? v2Colors.ground : v2Colors.ink} />
              </View>
            ) : (
              // Desktop: text button
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
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default V2EventCard;
