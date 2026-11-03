/**
 * V2 Brutalist Mono Info Card (NATIVE ONLY)
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
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

import { interFonts } from "@presentation/theme/fonts";
import {
  v2Borders,
  v2Colors,
  v2Duration,
  v2FontSizes,
  v2SpacingSemantic,
} from "@presentation/theme/v2-tokens";

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
        duration: v2Duration.normal,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: v2Duration.normal,
        delay: 500,
        useNativeDriver: true,
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
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
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
            stroke={v2Colors.ink}
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
            stroke={v2Colors.ink}
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

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const infoStyles = StyleSheet.create({
  card: {
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    padding: v2SpacingSemantic.m,
    marginBottom: v2SpacingSemantic.m,
    backgroundColor: v2Colors.ground,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: v2SpacingSemantic.s,
    marginBottom: v2SpacingSemantic.s,
  },
  rowLast: {
    marginBottom: 0,
  },
  iconContainer: {
    width: 20,
    height: 20,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  label: {
    fontFamily: interFonts.medium,
    fontSize: v2FontSizes.xs,
    color: v2Colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.xs * 0.05,
  },
  value: {
    fontFamily: interFonts.semiBold,
    fontSize: v2FontSizes.s,
    color: v2Colors.ink,
    marginTop: 2,
  },
});
