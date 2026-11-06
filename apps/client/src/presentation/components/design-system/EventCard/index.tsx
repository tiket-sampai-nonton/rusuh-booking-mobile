/**
 * RBT-096 — EventCard
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
import { useCallback, useEffect, useState } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import type { EventSummary } from "@domain/repositories/event.repository";
import { badgeFor, type BadgeTone } from "@domain/rules/event-display";
import { eventImage } from "@domain/rules/event-image";
import { formatDateID } from "@domain/services/date-format";
import { minorToIDR } from "@domain/services/money";
import {
  designColors,
  designEasing,
  designDuration,
  designSpacingSemantic,
  designShadows,
} from "@presentation/theme";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { pointerEventsNone } from "@presentation/utils/style";
import { ArrowIcon, PinIcon } from "@presentation/components/ArrowIcon";
import { componentStyles } from "./style";
import {
  eventCardContainerStyle,
  eventCardImageContainerStyle,
  eventCardImageStyle,
  eventCardContentStyle,
  eventCardFooterStyle,
  styleForEventCardView0,
  styleForEventCardAnimatedView1,
  styleForEventCardPressable2,
  styleForEventCardAnimatedView3,
  styleForEventCardAnimatedView4,
  styleForEventCardAnimatedView5,
  styleForEventCardText6,
  styleForEventCardText7,
  styleForEventCardAnimatedText8,
  styleForEventCardView9,
  styleForEventCardText10,
  styleForEventCardText11,
  styleForEventCardView12,
  styleForEventCardView13,
} from "./style";

const EASE = Easing.bezier(...designEasing.primary);
const STAGGER_DELAY_MS = 100; // Mobile prototype: stagger 100ms per card
const isWeb = Platform.OS === "web";

// Mobile design tokens (v2-mobile/design-tokens.css)
const MOBILE_CONTENT_PADDING = 16; // --space-s
const MOBILE_DATE_SIZE = 12; // --text-xs
const MOBILE_TITLE_SIZE = 16; // --text-m
const MOBILE_VENUE_SIZE = 12;

// Desktop design tokens
const DESKTOP_CONTENT_PADDING = designSpacingSemantic.m; // 24px
const DESKTOP_DATE_SIZE = 14; // --text-s
const DESKTOP_TITLE_SIZE = 20; // --text-l
const DESKTOP_VENUE_SIZE = 14; // --text-s

export interface EventCardProps {
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
  ok: "Tersedia",
  low: "Stok Menipis",
  soon: "Segera",
  soldout: "Habis Terjual",
  done: "Selesai",
};

export function EventCard({
  event,
  onPress,
  history = false,
  staggerIndex = 0,
  listMode = false,
  isImageVisible = true,
}: EventCardProps) {
  const reducedMotion = useReducedMotion();
  const { isNative, isMobileWeb } = useResponsive();
  const isMobileLayout = isNative || isMobileWeb;
  const compactListMode = listMode || isMobileWeb;
  const hovered = useSharedValue(0);
  const colorReveal = useSharedValue(isNative ? 0 : 1);
  const staggerOpacity = useSharedValue(reducedMotion ? 1 : 0);
  const staggerTranslateY = useSharedValue(reducedMotion ? 0 : 20);
  const [isHovered, setIsHovered] = useState(false); // For web CSS filter
  const badge = badgeFor(event);
  const disabled = badge.disabled || history;
  const dateTxt = formatDateID(event.startsAt);
  const image = eventImage(event.id);
  const grayscaleImage = grayscaleImageUrl(image);

  useEffect(() => {
    if (!isNative) return;
    if (!isImageVisible) {
      colorReveal.value = 0;
      return;
    }
    if (reducedMotion) {
      colorReveal.value = 1;
      return;
    }
    colorReveal.value = withTiming(1, { duration: 900, easing: EASE });
  }, [colorReveal, isImageVisible, isNative, reducedMotion]);
  const colorLayerStyle = useAnimatedStyle(() => ({
    opacity: colorReveal.value,
  }));

  // Mobile vs Desktop sizing
  const contentPadding = isMobileWeb
    ? 10
    : isNative
      ? MOBILE_CONTENT_PADDING
      : DESKTOP_CONTENT_PADDING;
  const dateSize = isMobileLayout ? MOBILE_DATE_SIZE : DESKTOP_DATE_SIZE;
  const titleSize = isMobileLayout ? MOBILE_TITLE_SIZE : DESKTOP_TITLE_SIZE;
  const venueSize = isMobileLayout ? MOBILE_VENUE_SIZE : DESKTOP_VENUE_SIZE;

  // Stagger animation on mount (mobile: FadeInUp.delay(index * 100))
  useEffect(() => {
    if (reducedMotion) {
      staggerOpacity.value = 1;
      staggerTranslateY.value = 0;
      return;
    }
    const delay = staggerIndex * STAGGER_DELAY_MS;
    staggerOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: EASE }),
    );
    staggerTranslateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: EASE }),
    );
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
        duration: designDuration.slow,
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
    transform: isMobileLayout
      ? [
          // Mobile: press feedback (translate down on press)
          {
            translateY:
              staggerTranslateY.value +
              interpolate(hovered.value, [0, 1], [0, 4]),
          },
        ]
      : [
          // Desktop: hover lift
          {
            translateY: interpolate(
              hovered.value,
              [0, 1],
              [staggerTranslateY.value, -8],
            ),
          },
          { perspective: 1000 },
          { rotateX: `${interpolate(hovered.value, [0, 1], [0, 2])}deg` },
        ],
    // Web only: animate shadow (native shadow is static in containerStyle)
    ...(isWeb
      ? {
          boxShadow: `${interpolate(hovered.value, [0, 1], [0, designShadows.lg.x])}px ${interpolate(hovered.value, [0, 1], [0, designShadows.lg.y])}px 0 rgba(0, 0, 0, ${interpolate(hovered.value, [0, 1], [0, 0.15])})`,
        }
      : {}),
  }));
  const nativeShadowStyle = useAnimatedStyle(() => ({
    opacity: staggerOpacity.value,
  }));

  // Image scale on hover: 1 → 1.05
  const imageScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(hovered.value, [0, 1], [1, 1.05]) }],
  }));

  // Badge slides in from left on hover (or always visible for certain states)
  const badgeAlwaysShow =
    badge.tone === "soldout" || badge.tone === "done" || badge.tone === "low";
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

  const containerStyle = eventCardContainerStyle(isHovered, disabled, isNative);
  const imageContainerStyle = eventCardImageContainerStyle(
    isNative,
    compactListMode,
    isWeb,
    isMobileWeb,
  );
  const webImageStyle = eventCardImageStyle(isWeb, isHovered);
  const contentStyle = eventCardContentStyle(
    contentPadding,
    isNative,
    isWeb,
    compactListMode,
    isMobileWeb,
  );
  const footerStyle = eventCardFooterStyle(isNative, isMobileWeb);

  return (
    <View style={isNative ? styleForEventCardView0() : undefined}>
      {isNative ? (
        <Animated.View
          style={[
            styleForEventCardAnimatedView1(),
            nativeShadowStyle,
            pointerEventsNone,
          ]}
        />
      ) : null}
      <Animated.View style={[containerStyle, cardStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${event.name}, ${event.venue ?? ""}, ${dateTxt}`}
          // Availability controls purchase styling, not access to event details.
          // Historical cards remain informational and intentionally non-interactive.
          accessibilityState={{ disabled: history }}
          disabled={history}
          onPress={() => onPress(event.id)}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          onPressIn={() => setHovered(true)}
          onPressOut={() => setHovered(false)}
          testID={`v2-event-card-${event.id}`}
          style={
            isWeb && compactListMode
              ? styleForEventCardPressable2(isMobileWeb)
              : undefined
          }
        >
          {/* Image with grayscale → color effect */}
          <View style={imageContainerStyle}>
            <Animated.View
              style={[styleForEventCardAnimatedView3(), imageScaleStyle]}
            >
              <Image
                source={{ uri: isNative ? grayscaleImage : image }}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
                style={webImageStyle}
              />
              {isNative ? (
                <Animated.View
                  style={[
                    styleForEventCardAnimatedView4(),
                    colorLayerStyle,
                    pointerEventsNone,
                  ]}
                >
                  <Image
                    source={{ uri: image }}
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                    style={componentStyles.elementWidth0}
                  />
                </Animated.View>
              ) : null}
            </Animated.View>

            {/* Badge */}
            <Animated.View
              style={[
                styleForEventCardAnimatedView5(isMobileLayout, badge),
                badgeStyle,
              ]}
            >
              <Text style={styleForEventCardText6(isMobileLayout)}>
                {BADGE_LABEL[badge.tone]}
              </Text>
            </Animated.View>
          </View>

          {/* Content */}
          <View style={contentStyle}>
            {/* Top section: date, title, venue */}
            <View>
              {/* Date: Mobile: 12px uppercase, Desktop: 14px */}
              {dateTxt && (
                <Text style={styleForEventCardText7(dateSize, isMobileLayout)}>
                  {dateTxt}
                </Text>
              )}

              {/* Title: Mobile: 16px weight 700 not-uppercase, Desktop: 20px weight 800 uppercase */}
              <Animated.Text
                style={[
                  styleForEventCardAnimatedText8(titleSize, isMobileLayout),
                  !isMobileLayout && titleStyle,
                ]}
                numberOfLines={2}
              >
                {event.name}
              </Animated.Text>

              {/* Venue: Mobile: 12px with icon, Desktop: 14px text only */}
              {event.venue && (
                <View style={styleForEventCardView9(isNative)}>
                  {isNative && (
                    <PinIcon color={designColors.inkMuted} size={12} />
                  )}
                  <Text
                    style={styleForEventCardText10(venueSize)}
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
                {isMobileLayout && (
                  <Text style={componentStyles.elementColor1}>Mulai dari</Text>
                )}
                <Text style={styleForEventCardText11(isMobileLayout)}>
                  {minorToIDR(event.minPriceMinor, { compact: true })}
                </Text>
              </View>

              {/* Action: Mobile: 32x32 icon button, Desktop: text button */}
              {isNative ? (
                // Mobile: 32x32 icon box
                <View style={styleForEventCardView12(disabled, isHovered)}>
                  <ArrowIcon
                    direction="right"
                    color={eventCardArrowColor(disabled, isHovered)}
                    size={16}
                  />
                </View>
              ) : (
                // Desktop: text button
                <View style={styleForEventCardView13(disabled, isHovered)}>
                  <Text style={componentStyles.elementColor2}>
                    {eventCardActionLabel(disabled)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default EventCard;

function grayscaleImageUrl(image: string): string {
  if (!image.includes("images.unsplash.com")) return image;
  const separator = image.includes("?") ? "&" : "?";
  return `${image}${separator}sat=-100`;
}

function eventCardArrowColor(disabled: boolean, isHovered: boolean): string {
  return disabled || isHovered ? designColors.ground : designColors.ink;
}

function eventCardActionLabel(disabled: boolean): string {
  if (disabled) return "Habis";
  return "Beli";
}
