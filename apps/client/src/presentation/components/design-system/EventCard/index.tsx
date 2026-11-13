/**
 * RBT-096 — EventCard
 * RBT-097 — Mobile: stagger animation (FadeInUp.delay(index * 100))
 *
 * MASTER-SPEC §3.1 Event Card:
 * - Background: shared ground token
 * - Hover: translateY(-8px) rotateX(2deg), shadow
 * - Image: grayscale 100% → 0% on hover (CSS filter on web)
 * - Badge slides in from left on hover
 * - border: 2px solid the shared ink token
 * - Gap: 2px creates border effect (handled by parent grid)
 *
 * Mobile prototype v2-mobile/01-home.html differences:
 * - Card: always has 4px 4px hard shadow
 * - Content padding: --space-s (16px) not --space-m (24px)
 * - Date: 12px, uppercase, letter-spacing 0.05em
 * - Title: 16px, weight 700, NOT uppercase, line-height 1.3
 * - Venue: 12px with icon
 * - Footer: 1px dashed border (not 2px solid), 32x32 icon btn
 * - Badge: 10px, shared status/brand token background
 */
import { memo, useCallback, useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { CachedImage } from "@presentation/components/design-system/CachedImage";
import { LazyCachedImage } from "@presentation/components/design-system/LazyCachedImage";
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
  withAlpha,
} from "@presentation/theme";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { pointerEventsNone } from "@presentation/utils/style";
import { ArrowIcon, PinIcon } from "@presentation/components/ArrowIcon";
import {
  componentStyles,
  eventCardContainerStyle,
  eventCardImageContainerStyle,
  eventCardImageStyle,
  eventCardContentStyle,
  eventCardFooterStyle,
  styleForEventCardView0,
  styleForEventCardAnimatedView1,
  styleForEventCardPressable2,
  styleForEventCardAnimatedView3,
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
  /** History/archive mode: dimmed but still opens its informational detail. */
  readonly history?: boolean;
  /** Index for stagger animation (mobile: delay(index * 100ms)) */
  readonly staggerIndex?: number;
  /** List view mode: use 16:9 aspect ratio instead of 1:1 */
  readonly listMode?: boolean;
}

/** Badge label per tone */
const BADGE_LABEL: Record<BadgeTone, string> = {
  ok: "Tersedia",
  low: "Stok Menipis",
  soon: "Segera",
  soldout: "Habis Terjual",
  done: "Selesai",
};

function EventCardComponent(props: EventCardProps) {
  const isNative = Platform.OS !== "web";
  return isNative ? (
    <NativeEventCard
      event={props.event}
      onPress={props.onPress}
      history={props.history}
      listMode={props.listMode}
    />
  ) : (
    <AnimatedEventCard {...props} />
  );
}

/** Native event cards are static while scrolling; avoid per-cell Reanimated worklets. */
type NativeEventCardProps = Pick<
  EventCardProps,
  "event" | "onPress" | "history" | "listMode"
>;

function NativeEventCard({
  event,
  onPress,
  history = false,
  listMode = false,
}: NativeEventCardProps) {
  const badge = badgeFor(event);
  const disabled = badge.disabled || history;
  const dateTxt = formatDateID(event.startsAt);
  const image = eventImage(event.id, event.thumbnailUrl ?? event.imageUrl);
  const imageUri = resizeNativeUnsplashImage(image, listMode);

  return (
    <View style={styleForEventCardView0()}>
      <View style={[styleForEventCardAnimatedView1(), pointerEventsNone]} />
      <View style={eventCardContainerStyle(false, disabled, true)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${event.name}, ${event.venue ?? ""}, ${dateTxt}`}
          accessibilityState={{ disabled: false }}
          onPress={() => onPress(event.id)}
          testID={`v2-event-card-${event.id}`}
        >
          <View style={eventCardImageContainerStyle(true, listMode, false)}>
            <View style={styleForEventCardAnimatedView3()}>
              <CachedImage
                source={{ uri: imageUri }}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
                style={eventCardImageStyle(false, false)}
              />
            </View>
            <View
              style={[
                styleForEventCardAnimatedView5(true, badge),
                {
                  opacity: 1,
                  transform: [{ translateX: 0 }],
                },
              ]}
            >
              <Text style={styleForEventCardText6(true)}>
                {BADGE_LABEL[badge.tone]}
              </Text>
            </View>
          </View>

          <View
            style={eventCardContentStyle(
              MOBILE_CONTENT_PADDING,
              true,
              false,
              listMode,
            )}
          >
            <View>
              {Boolean(dateTxt) && (
                <Text style={styleForEventCardText7(MOBILE_DATE_SIZE, true)}>
                  {dateTxt}
                </Text>
              )}
              <Text
                style={styleForEventCardAnimatedText8(MOBILE_TITLE_SIZE, true)}
                numberOfLines={2}
              >
                {event.name}
              </Text>
              {event.venue && (
                <View style={styleForEventCardView9(true)}>
                  <PinIcon color={designColors.inkMuted} size={12} />
                  <Text
                    style={styleForEventCardText10(MOBILE_VENUE_SIZE)}
                    numberOfLines={1}
                  >
                    {event.venue}
                  </Text>
                </View>
              )}
            </View>

            <View style={eventCardFooterStyle(true)}>
              <View>
                <Text style={componentStyles.elementColor1}>Mulai dari</Text>
                <Text style={styleForEventCardText11(true)}>
                  {minorToIDR(event.minPriceMinor)}
                </Text>
              </View>
              <View style={styleForEventCardView12(disabled)}>
                <ArrowIcon
                  direction="right"
                  color={eventCardArrowColor(disabled, false)}
                  size={16}
                />
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function AnimatedEventCard({
  event,
  onPress,
  history = false,
  staggerIndex = 0,
  listMode = false,
}: EventCardProps) {
  const reducedMotion = useReducedMotion();
  const { isNative, isMobileWeb } = useResponsive();
  const isMobileLayout = isNative || isMobileWeb;
  const compactListMode = listMode || isMobileWeb;
  const hovered = useSharedValue(0);
  const staggerOpacity = useSharedValue(reducedMotion || isNative ? 1 : 0);
  const staggerTranslateY = useSharedValue(reducedMotion || isNative ? 0 : 20);
  const [isHovered, setIsHovered] = useState(false); // For web CSS filter
  const badge = badgeFor(event);
  const disabled = badge.disabled || history;
  const dateTxt = formatDateID(event.startsAt);
  const image = eventImage(event.id, event.thumbnailUrl ?? event.imageUrl);
  const imageSource = isNative
    ? { uri: resizeNativeUnsplashImage(image, listMode) }
    : responsiveWebImageSource(image, compactListMode);

  // Mobile vs Desktop sizing
  let contentPadding: number = DESKTOP_CONTENT_PADDING;
  if (isNative) contentPadding = MOBILE_CONTENT_PADDING;
  if (isMobileWeb) contentPadding = 10;
  const dateSize = isMobileLayout ? MOBILE_DATE_SIZE : DESKTOP_DATE_SIZE;
  const titleSize = isMobileLayout ? MOBILE_TITLE_SIZE : DESKTOP_TITLE_SIZE;
  const venueSize = isMobileLayout ? MOBILE_VENUE_SIZE : DESKTOP_VENUE_SIZE;

  // Stagger animation on mount (mobile: FadeInUp.delay(index * 100))
  useEffect(() => {
    // Virtualized native cells can mount repeatedly while scrolling. Keep them
    // static there; web retains the stagger entrance motion.
    if (reducedMotion || isNative) {
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
  }, [
    isNative,
    reducedMotion,
    staggerIndex,
    staggerOpacity,
    staggerTranslateY,
  ]);

  const setHovered = useCallback(
    (v: boolean) => {
      if (disabled) return;
      if (isWeb) setIsHovered(v); // Web hover styles only.
      if (isNative) return; // Native cards stay static during fast scrolling.
      if (reducedMotion) {
        hovered.value = v ? 1 : 0;
        return;
      }
      hovered.value = withTiming(v ? 1 : 0, {
        duration: designDuration.slow,
        easing: EASE,
      });
    },
    [disabled, isNative, reducedMotion, hovered],
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
          boxShadow: `${interpolate(hovered.value, [0, 1], [0, designShadows.lg.x])}px ${interpolate(hovered.value, [0, 1], [0, designShadows.lg.y])}px 0 ${withAlpha(designColors.ink, interpolate(hovered.value, [0, 1], [0, 0.15]))}`,
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

  // Availability is visible without hover so users can scan cards on touch devices.
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: 0 }],
    opacity: 1,
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
          // Availability and history control styling; event details remain
          // accessible after ticket sales have ended.
          accessibilityState={{ disabled: false }}
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
              <LazyCachedImage
                source={imageSource}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
                style={webImageStyle}
                deferUntilVisible
              />
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
              {Boolean(dateTxt) && (
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
                  {minorToIDR(event.minPriceMinor)}
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

export const EventCard = memo(EventCardComponent);
export default EventCard;

function resizeNativeUnsplashImage(uri: string, listMode: boolean): string {
  if (!uri.includes("images.unsplash.com")) return uri;

  return resizeUnsplashImage(uri, listMode ? 960 : 576, 75);
}

function responsiveWebImageSource(
  uri: string,
  listMode: boolean,
): { uri: string; width: number }[] | { uri: string } {
  if (!uri.includes("images.unsplash.com")) {
    // FastImage's web adapter marks multi-size sources as loading="lazy".
    // The BE media URLs do not currently expose width variants, so keep their
    // URL unchanged while using the responsive-source path to defer offscreen
    // event-card downloads. Native cards use their own cache-backed URI.
    return [
      { uri, width: 640 },
      { uri, width: 960 },
    ];
  }

  const widths = listMode ? [640, 960] : [480, 768];
  return widths.map((width) => ({
    uri: resizeUnsplashImage(uri, width, 56),
    width,
  }));
}

function resizeUnsplashImage(uri: string, width: number, quality: number) {
  const [path, query = ""] = uri.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("w", String(width));
  params.set("q", String(quality));
  return `${path}?${params.toString()}`;
}

function eventCardArrowColor(disabled: boolean, isHovered: boolean): string {
  return disabled || isHovered ? designColors.ground : designColors.ink;
}

function eventCardActionLabel(disabled: boolean): string {
  if (disabled) return "Habis";
  return "Beli";
}
