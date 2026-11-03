/**
 * V2 Brutalist Mono Hero Section
 *
 * MATCHES: `.genesis/prototype/v2-mobile/02-event-detail.html` (native)
 * MATCHES: `.oil-ui/v2/02-event-detail.html` (web)
 *
 * Mobile-specific:
 * - Height: 50vh (vs 60vh on web)
 * - No meta items in hero (moved to info card below)
 * - No chips in hero
 * - Grayscale with dark overlay gradient
 *
 * Features:
 * - Grayscale background image (Ken Burns zoom animation on web)
 * - Gradient overlay (ground at bottom for native, white gradient for web)
 * - Scan line effect (subtle horizontal lines, web only)
 * - Badge with live dot
 * - Large uppercase title
 */
import { LinearGradient } from "expo-linear-gradient";
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

  const isNative = Platform.OS !== "web";

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
    } else {
      // Native: settle animation (scale 1.1 → 1.05)
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 1200,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim, scaleAnim, slideAnim]);

  const isLive = statusLabel.toLowerCase().includes("live") ||
                 statusLabel.toLowerCase().includes("tersedia") ||
                 statusLabel.toLowerCase().includes("dibuka");

  return (
    <View style={styles.hero}>
      {/* Background Image (Grayscale + Ken Burns/Settle) */}
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
        {/* Native: grayscale overlay (two-layer like home hero) */}
        {isNative && (
          <>
            <View style={[StyleSheet.absoluteFill, heroStyles.nativeGrayscaleDark]} />
            <View style={[StyleSheet.absoluteFill, heroStyles.nativeGrayscaleGray]} />
          </>
        )}
      </Animated.View>

      {/* Gradient Overlay */}
      {/* Native: linear-gradient(to top, ground 0%, rgba(0,0,0,0.3) 50%, transparent 100%) */}
      {/* Web: linear-gradient(to top, ground 0%, 0.8 30%, 0.3 60%, transparent 100%) */}
      {isNative ? (
        <LinearGradient
          colors={[
            v2Colors.ground, // 0% - ground at bottom
            "rgba(0,0,0,0.3)", // 50% - dark overlay
            "transparent", // 100% - transparent at top
          ]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 1 }} // from bottom
          end={{ x: 0.5, y: 0 }} // to top
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, heroStyles.overlayWeb]} />
      )}

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

        {/* Meta Items (WEB ONLY - native uses info card below) */}
        {!isNative && (
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
        )}

        {/* Chips (WEB ONLY - optional ticket count, etc) */}
        {!isNative && chips && chips.length > 0 && (
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
  // Web: gradient from white at bottom
  overlayWeb: {
    backgroundColor: "transparent",
    ...(Platform.OS === "web" && {
      backgroundImage: `linear-gradient(
        to top,
        ${v2Colors.ground} 0%,
        rgba(255,255,255,0.8) 30%,
        rgba(255,255,255,0.3) 60%,
        rgba(255,255,255,0) 100%
      )`,
    }),
  },
  // Native grayscale layers (simulates grayscale filter)
  nativeGrayscaleDark: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  nativeGrayscaleGray: {
    backgroundColor: "rgba(128, 128, 128, 0.65)",
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
