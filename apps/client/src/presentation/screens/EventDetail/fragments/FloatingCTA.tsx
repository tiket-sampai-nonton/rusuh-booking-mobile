/**
 * V2 Brutalist Mono Floating CTA Bar
 *
 * MATCHES: `.genesis/prototype/v2-mobile/02-event-detail.html` .floating-cta (native)
 * MATCHES: `.oil-ui/v2/02-event-detail.html` .floating-cta (web)
 *
 * Mobile-specific:
 * - Safe area bottom padding
 * - Native shadow (hard offset)
 * - Attention pulse animation
 * - Active press state (swap colors + translate)
 * - No trust badges (web only)
 *
 * Features:
 * - Fixed bottom bar with top border
 * - Price display on left
 * - Pulse glow animation on CTA button
 */
import { useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, Text, View } from "react-native";

import type { EventDetail } from "@domain/repositories/event.repository";
import { minorToIDR } from "@domain/services/money";
import { v2Colors, v2Duration } from "@presentation/theme/v2-tokens";

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
  const isNative = Platform.OS !== "web";

  // Entrance slide-up animation
  const slideAnim = useRef(new Animated.Value(100)).current;
  // Pulse glow animation for the CTA button (web: shadow, native: scale)
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide up entrance
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: v2Duration.slow,
      delay: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation loop (only when enabled)
    if (canJoin) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: isNative, // Native can use scale, web uses shadow
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: isNative,
          }),
        ])
      ).start();
    }
  }, [slideAnim, pulseAnim, canJoin, isNative]);

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

          {/* Trust Badges - Web only */}
          {!isNative && <TrustBadges />}
        </View>

        {/* Right: CTA Button */}
        {isNative ? (
          <NativeCTAButton
            label={ctaLabel}
            disabled={disabled}
            canJoin={canJoin}
            onJoin={onJoin}
            pulseAnim={pulseAnim}
          />
        ) : (
          <WebCTAButton
            label={ctaLabel}
            disabled={disabled}
            canJoin={canJoin}
            onJoin={onJoin}
            pulseAnim={pulseAnim}
          />
        )}
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEB CTA BUTTON (Shadow pulse)
// ═══════════════════════════════════════════════════════════════════════════════

interface CTAButtonProps {
  readonly label: string;
  readonly disabled: boolean;
  readonly canJoin: boolean;
  readonly onJoin: () => void;
  readonly pulseAnim: Animated.Value;
}

function WebCTAButton({ label, disabled, canJoin, onJoin, pulseAnim }: CTAButtonProps) {
  return (
    <Animated.View
      style={
        canJoin
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
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onJoin}
        testID="join-cta"
        style={[
          styles.floatingCtaBtn,
          disabled && styles.floatingCtaBtnDisabled,
        ]}
      >
        <Text style={styles.floatingCtaBtnText}>{label}</Text>
        {canJoin && <Text style={styles.floatingCtaArrow}>→</Text>}
      </Pressable>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NATIVE CTA BUTTON (Scale pulse + active state)
// ═══════════════════════════════════════════════════════════════════════════════

function NativeCTAButton({ label, disabled, canJoin, onJoin, pulseAnim }: CTAButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  // Native: subtle scale pulse (1.0 → 1.02)
  const scaleValue = canJoin
    ? pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.02],
      })
    : 1;

  return (
    <Animated.View
      style={[
        styles.floatingCtaBtnContainer, // Static shadow (avoids NOBRIDGE error)
        { transform: [{ scale: scaleValue }] },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onJoin}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        testID="join-cta"
        style={[
          styles.floatingCtaBtn,
          disabled && styles.floatingCtaBtnDisabled,
          // Active state: swap colors + translate
          isPressed && !disabled && {
            backgroundColor: v2Colors.ground,
            transform: [{ translateX: 4 }, { translateY: 4 }],
          },
        ]}
      >
        <Text
          style={[
            styles.floatingCtaBtnText,
            isPressed && !disabled && { color: v2Colors.ink },
          ]}
        >
          {label}
        </Text>
        {canJoin && (
          <Text
            style={[
              styles.floatingCtaArrow,
              isPressed && !disabled && { color: v2Colors.ink },
            ]}
          >
            →
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRUST BADGES (Web only - inline in floating CTA)
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
