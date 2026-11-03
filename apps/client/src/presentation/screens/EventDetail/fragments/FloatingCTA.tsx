/**
 * V2 Brutalist Mono Floating CTA Bar
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html` .floating-cta
 *
 * Features:
 * - Fixed bottom bar with top border
 * - Price display on left
 * - Pulse glow animation on CTA button
 * - Trust badges row below
 */
import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, Text, View } from "react-native";

import type { EventDetail } from "@domain/repositories/event.repository";
import { minorToIDR } from "@domain/services/money";
import { v2Duration } from "@presentation/theme/v2-tokens";

import { v2DetailStyles as styles } from "../style";

// ═══════════════════════════════════════════════════════════════════════════════
// FLOATING CTA COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface FloatingCTAProps {
  readonly event: EventDetail;
  readonly canJoin: boolean;
  readonly ctaLabel: string;
  readonly onJoin: () => void;
}

export function FloatingCTA({
  event,
  canJoin,
  ctaLabel,
  onJoin,
}: FloatingCTAProps) {
  // Entrance slide-up animation
  const slideAnim = useRef(new Animated.Value(100)).current;
  // Pulse glow animation for the CTA button
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide up entrance
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: v2Duration.slow,
      delay: 1000,
      useNativeDriver: true,
    }).start();

    // Pulse glow loop (only when enabled)
    if (canJoin) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false, // shadowRadius doesn't support native driver
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [slideAnim, pulseAnim, canJoin]);

  const priceText =
    typeof event.minPriceMinor === "number"
      ? minorToIDR(event.minPriceMinor, { compact: true })
      : "Menyusul";

  const disabled = !canJoin;

  return (
    <Animated.View
      style={[
        styles.floatingCta,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.floatingCtaInner}>
        {/* Left: Price Info */}
        <View style={styles.floatingCtaInfo}>
          <Text style={styles.floatingCtaPriceLabel}>Mulai dari</Text>
          <Text style={styles.floatingCtaPrice}>{priceText}</Text>

          {/* Trust Badges */}
          <TrustBadges />
        </View>

        {/* Right: CTA Button */}
        <Animated.View
          style={
            Platform.OS === "web" && canJoin
              ? ({
                  // Web-only pulse glow animation
                  boxShadow: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      "0 0 0 0 rgba(0,0,0,0.3)",
                      "0 0 20px 5px rgba(0,0,0,0.2)",
                    ],
                  }),
                } as any)
              : undefined
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onJoin}
            testID="join-cta"
            style={[
              styles.floatingCtaBtn,
              disabled && styles.floatingCtaBtnDisabled,
            ]}
          >
            <Text style={styles.floatingCtaBtnText}>{ctaLabel}</Text>
            {canJoin && <Text style={styles.floatingCtaArrow}>→</Text>}
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRUST BADGES (inline in floating CTA)
// ═══════════════════════════════════════════════════════════════════════════════

const TRUST_BADGES = [
  { icon: "✓", text: "Tiket resmi" },
  { icon: "✓", text: "Antrean adil" },
  { icon: "✓", text: "E-ticket instan" },
] as const;

function TrustBadges() {
  return (
    <View style={styles.trustBadges}>
      {TRUST_BADGES.map((badge) => (
        <View key={badge.text} style={styles.trustBadge}>
          <Text style={styles.trustBadgeCheck}>{badge.icon}</Text>
          <Text style={styles.trustBadgeText}>{badge.text}</Text>
        </View>
      ))}
    </View>
  );
}
