/**
 *  Brutalist Mono Floating CTA Bar
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
import { useEffect, useRef } from "react";
import { Animated, Platform, Text, View } from "react-native";

import type { EventDetail } from "@domain/repositories/event.repository";
import { minorToIDR } from "@domain/services/money";
import { designDuration } from "@presentation/theme/event-design-tokens";

import { designDetailStyles as styles } from "../../style";
import { nativeDriverSupported } from "@presentation/utils/style";
import { NativeCTAButton } from "./NativeCTAButton";
import { TrustBadges } from "./TrustBadges";
import { WebCTAButton } from "./WebCTAButton";
import { floatingCtaEntranceStyle } from "./style";

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
      duration: designDuration.slow,
      delay: 800,
      useNativeDriver: nativeDriverSupported(),
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
        ]),
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
      style={[styles.floatingCta, floatingCtaEntranceStyle(slideAnim)]}
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
