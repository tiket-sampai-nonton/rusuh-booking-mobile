/**
 * V2 Brutalist Mono Hero Section
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html` .hero
 *
 * Features:
 * - Grayscale background image (Ken Burns zoom animation on web)
 * - White gradient overlay (bottom to top)
 * - Scan line effect (subtle horizontal lines)
 * - Badge with live dot
 * - Large uppercase title
 * - Meta items (date, time, venue)
 */
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { interFonts } from "@presentation/theme/fonts";
import { v2Colors, v2Duration } from "@presentation/theme/v2-tokens";

import type { DetailHeroProps } from "../interface";
import { v2DetailStyles as styles } from "../style";

// ═══════════════════════════════════════════════════════════════════════════════
// HERO COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function DetailHero({
  banner,
  statusLabel,
  name,
  meta,
  chips,
  subtitle,
}: DetailHeroProps & { subtitle?: string }) {
  // Ken Burns zoom animation (web only)
  const scaleAnim = useRef(new Animated.Value(1.1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: v2Duration.slow,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Ken Burns zoom (web only, infinite)
    if (Platform.OS === "web") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 20000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 20000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [fadeAnim, scaleAnim, slideAnim]);

  const isLive = statusLabel.toLowerCase().includes("live") ||
                 statusLabel.toLowerCase().includes("tersedia") ||
                 statusLabel.toLowerCase().includes("dibuka");

  return (
    <View style={styles.hero}>
      {/* Background Image (Grayscale + Ken Burns) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={{ uri: banner }}
          style={[
            StyleSheet.absoluteFill,
            // Web-only grayscale filter applied via inline style
            Platform.OS === "web" && ({ filter: "grayscale(100%) contrast(1.2)" } as any),
          ]}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </Animated.View>

      {/* Gradient Overlay (white at bottom) */}
      <View style={[StyleSheet.absoluteFill, heroStyles.overlay]} />

      {/* Scan Lines (web only) */}
      {Platform.OS === "web" && <View style={styles.heroScanlines} />}

      {/* Content */}
      <View style={styles.heroContent}>
        {/* Badge */}
        <Animated.View
          style={[
            styles.heroBadge,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {isLive && <View style={styles.liveDot} />}
          <Text style={styles.heroBadgeText}>{statusLabel}</Text>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.heroTitle,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
          accessibilityRole="header"
          numberOfLines={3}
        >
          {name}
        </Animated.Text>

        {/* Subtitle (optional) */}
        {subtitle && (
          <Animated.Text
            style={[
              styles.heroSubtitle,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {subtitle}
          </Animated.Text>
        )}

        {/* Meta Items */}
        <Animated.View
          style={[
            styles.heroMeta,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {meta.split(" · ").map((item, i) => (
            <View key={i} style={styles.heroMetaItem}>
              <Text style={heroStyles.metaIcon}>{getMetaIcon(i)}</Text>
              <Text style={styles.heroMetaText}>{item}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Chips (optional - ticket count, etc) */}
        {chips && chips.length > 0 && (
          <Animated.View
            style={[
              heroStyles.chipRow,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {chips.map((chip) => (
              <View key={chip} style={heroStyles.chip}>
                <Text style={heroStyles.chipText}>{chip}</Text>
              </View>
            ))}
          </Animated.View>
        )}
      </View>
    </View>
  );
}

// Helper to get icon for meta item
function getMetaIcon(index: number): string {
  switch (index) {
    case 0: return "📅"; // Date
    case 1: return "🕐"; // Time
    case 2: return "📍"; // Location
    default: return "•";
  }
}

// Local styles for hero-specific elements
const heroStyles = StyleSheet.create({
  overlay: {
    backgroundColor: "transparent",
    // Gradient effect via linear-gradient on web
    ...(Platform.OS === "web" && {
      backgroundImage: `linear-gradient(
        to top,
        ${v2Colors.ground} 0%,
        rgba(255,255,255,0.8) 30%,
        rgba(255,255,255,0.3) 60%,
        rgba(255,255,255,0) 100%
      )`,
    }),
    // Native fallback: semi-transparent white at bottom
    ...(Platform.OS !== "web" && {
      backgroundColor: "rgba(255,255,255,0.5)",
    }),
  },
  metaIcon: {
    fontSize: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 15,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
  },
  chipText: {
    fontFamily: interFonts.semiBold,
    fontSize: 11,
    color: v2Colors.ink,
    textTransform: "uppercase",
  },
});
