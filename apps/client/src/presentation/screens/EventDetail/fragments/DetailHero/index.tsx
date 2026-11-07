/**
 *  Brutalist Mono Hero Section
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
  type ImageStyle,
} from "react-native";

import {
  designColors,
  designDuration,
} from "@presentation/theme/event-design-tokens";
import { withAlpha } from "@presentation/theme";
import {
  CalendarIcon,
  ClockIcon,
  PinIcon,
} from "@presentation/components/ArrowIcon";

import type { DetailHeroProps } from "../../interface";
import { designDetailStyles as styles } from "../../style";
import { nativeDriverSupported } from "@presentation/utils/style";
import { heroStyles } from "./style";
import {
  styleForDetailHeroAnimatedView0,
  styleForDetailHeroImage1,
  styleForDetailHeroAnimatedView2,
  styleForDetailHeroAnimatedText3,
  styleForDetailHeroAnimatedText4,
  styleForDetailHeroAnimatedView5,
  styleForDetailHeroAnimatedView6,
} from "./style";

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
  isMobileWeb = false,
}: DetailHeroProps & { subtitle?: string }) {
  // Ken Burns zoom animation (web only)
  const scaleAnim = useRef(new Animated.Value(1.1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const isNative = Platform.OS !== "web";

  useEffect(() => {
    // Entrance animations
    const entranceDuration = isMobileWeb ? 160 : designDuration.slow;
    const entranceDelay = isMobileWeb ? 0 : 500;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: entranceDuration,
        delay: entranceDelay,
        useNativeDriver: nativeDriverSupported(),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: entranceDuration,
        delay: entranceDelay,
        useNativeDriver: nativeDriverSupported(),
      }),
    ]).start();

    // Ken Burns zoom (web only, infinite)
    if (Platform.OS === "web") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 20000,
            useNativeDriver: nativeDriverSupported(),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 20000,
            useNativeDriver: nativeDriverSupported(),
          }),
        ]),
      ).start();
    } else {
      // Native: settle animation (scale 1.1 → 1.05)
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 1200,
        useNativeDriver: nativeDriverSupported(),
      }).start();
    }
  }, [fadeAnim, isMobileWeb, scaleAnim, slideAnim]);

  const isLive =
    statusLabel.toLowerCase().includes("live") ||
    statusLabel.toLowerCase().includes("tersedia") ||
    statusLabel.toLowerCase().includes("dibuka");

  return (
    <View style={[styles.hero, isMobileWeb && styles.mobileWebHero]}>
      {/* Background Image (Grayscale + Ken Burns/Settle) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styleForDetailHeroAnimatedView0(scaleAnim),
        ]}
      >
        <Image
          source={{ uri: banner }}
          style={[
            StyleSheet.absoluteFill,
            // Web-only grayscale filter applied via inline style
            Platform.OS === "web" &&
              (styleForDetailHeroImage1() as unknown as ImageStyle),
          ]}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        {/* Native: grayscale overlay (two-layer like home hero) */}
        {isNative && (
          <>
            <View
              style={[StyleSheet.absoluteFill, heroStyles.nativeGrayscaleDark]}
            />
            <View
              style={[StyleSheet.absoluteFill, heroStyles.nativeGrayscaleGray]}
            />
          </>
        )}
      </Animated.View>

      {/* Gradient Overlay */}
      {/* Native: ground-to-overlay gradient from the shared color tokens */}
      {/* Web: linear-gradient(to top, ground 0%, 0.8 30%, 0.3 60%, transparent 100%) */}
      {isNative ? (
        <LinearGradient
          colors={[
            designColors.ground, // 0% - ground at bottom
            withAlpha(designColors.overlay, 0.3), // 50% - dark overlay
            "transparent", // 100% - transparent at top
          ]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 1 }} // from bottom
          end={{ x: 0.5, y: 0 }} // to top
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            isMobileWeb ? heroStyles.mobileWebOverlay : heroStyles.overlayWeb,
          ]}
        />
      )}

      {/* Scan Lines (web only) */}
      {Platform.OS === "web" && <View style={styles.heroScanlines} />}

      {/* Content */}
      <View
        style={[styles.heroContent, isMobileWeb && styles.mobileWebHeroContent]}
      >
        {/* Badge */}
        <Animated.View
          style={[
            styles.heroBadge,
            isMobileWeb && styles.mobileWebHeroBadge,
            styleForDetailHeroAnimatedView2(fadeAnim, slideAnim),
          ]}
        >
          {isLive && <View style={styles.liveDot} />}
          <Text
            style={[
              styles.heroBadgeText,
              isMobileWeb && styles.mobileWebHeroBadgeText,
            ]}
          >
            {statusLabel}
          </Text>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.heroTitle,
            isMobileWeb && styles.mobileWebHeroTitle,
            styleForDetailHeroAnimatedText3(fadeAnim, slideAnim),
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
              isMobileWeb && styles.mobileWebHeroSubtitle,
              styleForDetailHeroAnimatedText4(fadeAnim, slideAnim),
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
              isMobileWeb && styles.mobileWebHeroMeta,
              styleForDetailHeroAnimatedView5(fadeAnim, slideAnim),
            ]}
          >
            {meta.split(" · ").map((item, i) => (
              <View key={i} style={styles.heroMetaItem}>
                {getMetaIcon(i)}
                <Text
                  style={[
                    styles.heroMetaText,
                    isMobileWeb && styles.mobileWebHeroMetaText,
                  ]}
                >
                  {item}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Chips (WEB ONLY - optional ticket count, etc) */}
        {!isNative && !isMobileWeb && chips && chips.length > 0 && (
          <Animated.View
            style={[
              heroStyles.chipRow,
              styleForDetailHeroAnimatedView6(fadeAnim, slideAnim),
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
function getMetaIcon(index: number) {
  switch (index) {
    case 0:
      return <CalendarIcon />;
    case 1:
      return <ClockIcon />;
    case 2:
      return <PinIcon />;
    default:
      return null;
  }
}
