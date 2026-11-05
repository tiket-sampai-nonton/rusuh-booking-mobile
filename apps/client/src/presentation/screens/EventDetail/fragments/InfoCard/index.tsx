/**
 *  Brutalist Mono Info Card (NATIVE ONLY)
 *
 * MATCHES: `.genesis/prototype/v2-mobile/02-event-detail.html` .info-card
 *
 * Displays date/time and location below the hero on mobile.
 * Web shows this info in the hero meta items instead.
 *
 * Features:
 * - Bordered card with icon + label + value rows
 * - Entrance animation (slide up)
 */
import { useEffect, useRef } from "react";
import { Animated, Platform, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";


import { designColors, designDuration } from "@presentation/theme/event-design-tokens";
import { nativeDriverSupported } from "@presentation/utils/style";
import { infoStyles } from "./style";
import { styleForInfoCardAnimatedView0 } from './style';


// ═══════════════════════════════════════════════════════════════════════════════
// INFO CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface InfoCardProps {
  /** Formatted date string (e.g. "15 November 2024") */
  readonly date: string;
  /** Formatted time string (e.g. "19:00 WIB") */
  readonly time: string;
  /** Venue name/address */
  readonly venue: string;
}

export function InfoCard({ date, time, venue }: InfoCardProps) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Only animate on native
    if (Platform.OS === "web") return;

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: designDuration.normal,
        delay: 500,
        useNativeDriver: nativeDriverSupported(),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: designDuration.normal,
        delay: 500,
        useNativeDriver: nativeDriverSupported(),
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  // Only render on native
  if (Platform.OS === "web") {
    return null;
  }

  const dateTime = time ? `${date}, ${time}` : date;

  return (
    <Animated.View
      style={[
        infoStyles.card,
        styleForInfoCardAnimatedView0(opacityAnim, slideAnim),
      ]}
    >
      {/* Date Row */}
      <View style={infoStyles.row}>
        <View style={infoStyles.iconContainer}>
          <Svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke={designColors.ink}
            strokeWidth={2}
          >
            <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <Line x1="16" y1="2" x2="16" y2="6" />
            <Line x1="8" y1="2" x2="8" y2="6" />
            <Line x1="3" y1="10" x2="21" y2="10" />
          </Svg>
        </View>
        <View style={infoStyles.content}>
          <Text style={infoStyles.label}>Tanggal</Text>
          <Text style={infoStyles.value}>{dateTime}</Text>
        </View>
      </View>

      {/* Location Row */}
      <View style={[infoStyles.row, infoStyles.rowLast]}>
        <View style={infoStyles.iconContainer}>
          <Svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke={designColors.ink}
            strokeWidth={2}
          >
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Circle cx="12" cy="10" r="3" />
          </Svg>
        </View>
        <View style={infoStyles.content}>
          <Text style={infoStyles.label}>Lokasi</Text>
          <Text style={infoStyles.value}>{venue}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
