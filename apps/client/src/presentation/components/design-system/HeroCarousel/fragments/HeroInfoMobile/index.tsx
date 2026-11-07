import { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";

import type { EventSummary } from "@domain/repositories/event.repository";
import { formatDateID } from "@domain/services/date-format";
import { designColors } from "@presentation/theme";

import { EASE, INFO_FADE_DELAY_MS } from "../../constants";
import { componentStyles, styleForHeroInfoMobileText6 } from "../../style";
import { useTextScramble } from "../../hooks/useTextScramble";
import { CalendarIcon } from "../CalendarIcon";
import { MapPinIcon } from "../MapPinIcon";
import { PulsingDot } from "../PulsingDot";
import { ArrowIcon } from "../ArrowIcon";

export function HeroInfoMobile({
  event,
  onBook,
  onSeeAll,
  isMobileWeb = false,
}: {
  readonly event: EventSummary;
  readonly onBook: (eventId: string) => void;
  readonly onSeeAll?: () => void;
  readonly isMobileWeb?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const { width } = useWindowDimensions();

  const scrambledTitle = useTextScramble(event.name);

  // fadeSlideUp animation from prototype: 0.6s delay after loader exit
  useEffect(() => {
    if (reducedMotion || isMobileWeb) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = 0;
    translateY.value = 30;

    opacity.value = withDelay(
      INFO_FADE_DELAY_MS,
      withTiming(1, { duration: 600, easing: EASE }),
    );
    translateY.value = withDelay(
      INFO_FADE_DELAY_MS,
      withTiming(0, { duration: 600, easing: EASE }),
    );
  }, [event.id, reducedMotion, isMobileWeb, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Mobile title size: smaller than desktop - clamp(2rem, 10vw, 3rem) = 32-48px
  // Reduced from original 40-64px for better mobile fit
  const titleFontSize = Math.min(Math.max(32, width * 0.1), 48);

  return (
    <Animated.View key={event.id} style={animatedStyle}>
      {/* Badge: "ON SALE NOW" with pulsing red dot */}
      <View
        style={[
          componentStyles.elementFlexDirection20,
          isMobileWeb && mobileWebStyles.badge,
        ]}
      >
        <PulsingDot />
        <Text
          style={[
            componentStyles.elementColor21,
            isMobileWeb && mobileWebStyles.badgeText,
          ]}
        >
          Penjualan dibuka
        </Text>
      </View>

      {/* Title: Large brutalist text */}
      <Text
        accessibilityRole="header"
        style={styleForHeroInfoMobileText6(titleFontSize, isMobileWeb)}
        numberOfLines={2}
      >
        {scrambledTitle}
      </Text>

      {/* Meta: Date · Venue (compact, single line with wrap) */}
      <View style={componentStyles.elementFlexDirection22}>
        <View style={componentStyles.elementFlexDirection23}>
          <CalendarIcon color={designColors.inkMuted} />
          <Text
            style={[
              componentStyles.elementColor24,
              isMobileWeb && mobileWebStyles.meta,
            ]}
          >
            {formatDateID(event.startsAt)}
          </Text>
        </View>
        {event.venue && (
          <View style={componentStyles.elementFlexDirection25}>
            <MapPinIcon color={designColors.inkMuted} />
            <Text
              style={[
                componentStyles.elementColor26,
                isMobileWeb && mobileWebStyles.meta,
              ]}
            >
              {event.venue}
            </Text>
          </View>
        )}
      </View>

      {isMobileWeb ? (
        <View style={mobileWebStyles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Lihat detail ${event.name}`}
            testID="hero-book"
            onPress={() => onBook(event.id)}
            style={mobileWebStyles.primary}
          >
            <Text style={mobileWebStyles.primaryText}>Lihat Detail</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Lihat semua event"
            testID="hero-see-all"
            onPress={onSeeAll}
            style={mobileWebStyles.secondary}
          >
            <Text style={mobileWebStyles.secondaryText}>Semua event →</Text>
          </Pressable>
        </View>
      ) : (
        <View style={componentStyles.elementAlignSelf27}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Beli tiket untuk ${event.name}`}
            testID="hero-book"
            onPress={() => onBook(event.id)}
            style={componentStyles.elementFlexDirection28}
          >
            <Text style={componentStyles.elementColor29}>Beli Tiket</Text>
            <ArrowIcon />
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

const mobileWebStyles = StyleSheet.create({
  badge: {
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  badgeText: { color: "#d71920", fontSize: 10, letterSpacing: 0.5 },
  meta: { color: "rgba(255,255,255,0.82)", fontSize: 12 },
  actions: { flexDirection: "row", alignItems: "center", gap: 16 },
  primary: {
    minHeight: 40,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  primaryText: {
    color: "#090909",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  secondary: { minHeight: 40, justifyContent: "center" },
  secondaryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
