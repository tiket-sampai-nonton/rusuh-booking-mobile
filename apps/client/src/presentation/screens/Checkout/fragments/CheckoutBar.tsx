/**
 * RBT-092 — V2 Brutalist Mono Checkout Bar
 *
 * PROTOTYPE 03-checkout.html .pay-section EXACT COPY:
 * - Black background, white text
 * - 2px borders, no rounded corners
 * - "Lanjut Bayar" button with white fill effect
 */
import { Pressable, Text, View, StyleSheet } from "react-native";

import { minorToIDR } from "@domain/services/money";
import { v2Colors, v2Borders, interFonts } from "@presentation/theme";

import type { CheckoutBarProps } from "../interface";

export function CheckoutBar({
  totalMinor,
  ready,
  pending,
  expired,
  errorMessage,
  onSubmit,
  bottomInset,
}: CheckoutBarProps) {
  const canSubmit = ready && !pending && !expired;

  return (
    <View style={[styles.container, { paddingBottom: bottomInset + 16 }]}>
      {/* Error message */}
      {errorMessage ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      ) : null}

      <View style={styles.content}>
        {/* Total */}
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue} testID="checkout-total">
            {minorToIDR(totalMinor)}
          </Text>
        </View>

        {/* Pay button (prototype .pay-btn) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lanjut Bayar"
          accessibilityState={{ disabled: !canSubmit }}
          disabled={!canSubmit}
          onPress={onSubmit}
          testID="checkout-submit"
          style={({ pressed }) => [
            styles.payButton,
            pressed && styles.payButtonPressed,
            !canSubmit && styles.payButtonDisabled,
          ]}
        >
          {({ pressed }) => (
            <Text
              style={[
                styles.payButtonText,
                (pressed || !canSubmit) && styles.payButtonTextPressed,
              ]}
            >
              {pending ? "Memproses…" : expired ? "Waktu habis" : "Lanjut Bayar"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: v2Colors.ink,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: v2Borders.standard,
    borderTopColor: v2Colors.ground,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    fontFamily: interFonts.medium,
    textAlign: "center",
    marginBottom: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontFamily: interFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  totalValue: {
    color: v2Colors.ground,
    fontSize: 20,
    fontFamily: interFonts.black,
    letterSpacing: -0.4,
  },
  payButton: {
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ground,
    backgroundColor: v2Colors.ground,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  payButtonPressed: {
    backgroundColor: v2Colors.ink,
  },
  payButtonDisabled: {
    opacity: 0.5,
    backgroundColor: v2Colors.ink,
  },
  payButtonText: {
    color: v2Colors.ink,
    fontSize: 14,
    fontFamily: interFonts.black,
    textTransform: "uppercase",
    letterSpacing: -0.28,
  },
  payButtonTextPressed: {
    color: v2Colors.ground,
  },
});
