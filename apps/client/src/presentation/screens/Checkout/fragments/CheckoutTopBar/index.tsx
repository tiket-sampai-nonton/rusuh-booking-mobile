/**
 * RBT-092 —  Brutalist Mono Checkout Top Bar
 *
 * PROTOTYPE 03-checkout.html top bar styling:
 * - Hard-bordered white bar with 2px border
 * - Timer badge with pulse animation when warning
 * - Uppercase back button
 */
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "@presentation/hooks/useResponsive";

import { formatCountdown } from "@domain/services/date-format";
import { ArrowIcon } from "@presentation/components/ArrowIcon";

import type { CheckoutTopBarProps } from "../../interface";
import { styles, componentStyles } from "./style";
import { styleForCheckoutTopBarView0 } from "./style";

export function CheckoutTopBar({
  remainingMs,
  warn,
  expired,
  onBack,
}: CheckoutTopBarProps) {
  const insets = useSafeAreaInsets();
  const { isMobileWeb } = useResponsive();
  const alarm = warn || expired;

  return (
    <View style={styleForCheckoutTopBarView0(insets)}>
      <View
        style={[styles.container, isMobileWeb && styles.mobileWebContainer]}
      >
        {/* Back button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onBack}
          testID="checkout-back"
          style={styles.backButton}
        >
          <View style={componentStyles.elementFlexDirection0}>
            <ArrowIcon direction="left" />
            {!isMobileWeb && <Text style={styles.backText}>Kembali</Text>}
          </View>
        </Pressable>

        {/* Timer badge (prototype .timer-bar style) */}
        <View
          style={[
            styles.timerBadge,
            isMobileWeb && styles.mobileWebTimerBadge,
            alarm && styles.timerBadgeWarning,
          ]}
        >
          <View style={[styles.timerDot, alarm && styles.timerDotWarning]} />
          <Text
            style={[
              styles.timerText,
              isMobileWeb && styles.mobileWebTimerText,
              alarm && styles.timerTextWarning,
            ]}
            accessibilityLabel={`Sisa waktu ${formatCountdown(remainingMs)}`}
            accessibilityLiveRegion="polite"
            testID="checkout-timer"
          >
            {formatCountdown(remainingMs)}
          </Text>
        </View>
      </View>
    </View>
  );
}
