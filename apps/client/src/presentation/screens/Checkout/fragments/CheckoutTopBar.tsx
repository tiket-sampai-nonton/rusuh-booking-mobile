/**
 * RBT-092 — V2 Brutalist Mono Checkout Top Bar
 *
 * PROTOTYPE 03-checkout.html top bar styling:
 * - Hard-bordered white bar with 2px border
 * - Timer badge with pulse animation when warning
 * - Uppercase back button
 */
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatCountdown } from "@domain/services/date-format";
import { v2Colors, v2Borders, interFonts } from "@presentation/theme";

import type { CheckoutTopBarProps } from "../interface";

export function CheckoutTopBar({ remainingMs, warn, expired, onBack }: CheckoutTopBarProps) {
  const insets = useSafeAreaInsets();
  const alarm = warn || expired;

  return (
    <View style={{ paddingTop: insets.top }}>
      <View style={styles.container}>
        {/* Back button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onBack}
          testID="checkout-back"
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Kembali</Text>
        </Pressable>

        {/* Timer badge (prototype .timer-bar style) */}
        <View style={[styles.timerBadge, alarm && styles.timerBadgeWarning]}>
          <View style={[styles.timerDot, alarm && styles.timerDotWarning]} />
          <Text
            style={[styles.timerText, alarm && styles.timerTextWarning]}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: v2Colors.ground,
    borderBottomWidth: v2Borders.standard,
    borderBottomColor: v2Colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    color: v2Colors.ink,
    fontSize: 14,
    fontFamily: interFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  timerBadgeWarning: {
    borderColor: "#ff0000",
    backgroundColor: "#ff0000",
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: v2Colors.ink,
  },
  timerDotWarning: {
    backgroundColor: v2Colors.ground,
  },
  timerText: {
    color: v2Colors.ink,
    fontSize: 16,
    fontFamily: "JetBrains Mono",
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  timerTextWarning: {
    color: v2Colors.ground,
  },
});
