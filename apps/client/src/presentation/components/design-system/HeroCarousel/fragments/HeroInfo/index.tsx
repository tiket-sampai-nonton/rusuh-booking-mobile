import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, useReducedMotion } from 'react-native-reanimated';

import type { EventSummary } from '@domain/repositories/event.repository';
import type { ServerClock } from '@domain/services/server-clock';
import { formatDateID } from '@domain/services/date-format';
import { INFO_FADE_DELAY_MS, EASE } from '../../constants';
import { componentStyles } from '../../style';
import { CalendarIcon } from '../CalendarIcon';
import { MapPinIcon } from '../MapPinIcon';
import { CountdownTimer } from '../CountdownTimer';

export function HeroInfo({
  event,
  targetDateIso,
  clock,
  onBook,
  onSeeAll,
}: {
  readonly event: EventSummary;
  readonly targetDateIso?: string;
  readonly clock: ServerClock;
  readonly onBook: (eventId: string) => void;
  readonly onSeeAll: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  // fadeUp animation: opacity 0 → 1, translateY 30 → 0, 0.6s delay
  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = 0;
    translateY.value = 30;

    opacity.value = withDelay(INFO_FADE_DELAY_MS, withTiming(1, { duration: 800, easing: EASE }));
    translateY.value = withDelay(INFO_FADE_DELAY_MS, withTiming(0, { duration: 800, easing: EASE }));
  }, [event.id, reducedMotion, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Tagline from prototype (each slide has its own tagline)
  const tagline = "Pengalaman konser tak terlupakan.";

  return (
    <Animated.View key={event.id} style={animatedStyle}>
      {/* Tagline (prototype .hero-tagline) */}
      <Text
        style={componentStyles.elementColor7}
      >
        {tagline}
      </Text>

      {/* Countdown only appears when the event has a real start time. */}
      {targetDateIso ? (
        <CountdownTimer expiresAtIso={targetDateIso} clock={clock} />
      ) : null}

      {/* Meta info (prototype .hero-meta) */}
      <View style={componentStyles.elementGap8}>
        <View style={componentStyles.elementFlexDirection9}>
          <CalendarIcon />
          <Text
            style={componentStyles.elementColor10}
          >
            {formatDateID(event.startsAt)}
          </Text>
        </View>
        {event.venue && (
          <View style={componentStyles.elementFlexDirection11}>
            <MapPinIcon />
            <Text
              style={componentStyles.elementColor12}
            >
              {event.venue}
            </Text>
          </View>
        )}
      </View>

      {/* Price (prototype .hero-price) */}
      <Text
        style={componentStyles.elementColor13}
      >
        Mulai <Text style={componentStyles.elementFontFamily14}>Rp {((event.minPriceMinor ?? 0) / 100).toLocaleString("id-ID")}</Text>
      </Text>

      {/* CTAs (prototype .hero-cta) */}
      <View style={componentStyles.elementFlexDirection15}>
        {/* Primary: Beli Tiket (prototype .btn-primary .btn-large) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Beli tiket ${event.name}`}
          testID="hero-book"
          onPress={() => onBook(event.id)}
          style={componentStyles.elementBackgroundColor16}
        >
          <Text
            style={componentStyles.elementColor17}
          >
            Beli Tiket
          </Text>
        </Pressable>

        {/* Secondary: Lihat Detail (prototype .btn-ghost .btn-large) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lihat detail event"
          testID="hero-detail"
          onPress={() => onBook(event.id)}
          style={componentStyles.elementBackgroundColor18}
        >
          <Text
            style={componentStyles.elementColor19}
          >
            Lihat Detail
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
