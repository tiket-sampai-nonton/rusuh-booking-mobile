/**
 * RBT-092 —  Brutalist Mono Checkout Bar
 *
 * PROTOTYPE 03-checkout.html .pay-section EXACT COPY:
 * - Black background, white text
 * - 2px borders, no rounded corners
 * - "Lanjut Bayar" button with white fill effect
 */
import { Pressable, Text, View, Platform } from "react-native";
import { useResponsive } from "@presentation/hooks/useResponsive";

import { minorToIDR } from "@domain/services/money";

import type { CheckoutBarProps } from "../../interface";
import { styles } from "./style";
import { styleForCheckoutBarView0, styleForCheckoutBarButton0 } from "./style";

export function CheckoutBar({
  totalMinor,
  ready,
  pending,
  expired,
  errorMessage,
  onSubmit,
  bottomInset,
}: CheckoutBarProps) {
  const { isMobileWeb } = useResponsive();
  const canSubmit = ready && !pending && !expired;

  return (
    <View
      style={[
        styles.container,
        isMobileWeb && styles.mobileWebContainer,
        styleForCheckoutBarView0(bottomInset, isMobileWeb),
      ]}
    >
      {/* Error message */}
      {errorMessage ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      ) : null}

      <View style={[styles.content, isMobileWeb && styles.mobileWebContent]}>
        {/* Total */}
        <View>
          <Text
            style={[
              styles.totalLabel,
              isMobileWeb && styles.mobileWebTotalLabel,
            ]}
          >
            Total
          </Text>
          <Text
            style={[
              styles.totalValue,
              isMobileWeb && styles.mobileWebTotalValue,
            ]}
            testID="checkout-total"
          >
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
            isMobileWeb && styles.mobileWebPayButton,
            Platform.OS !== "web" && styles.payButtonNative,
            pressed && styles.payButtonPressed,
            !canSubmit && styles.payButtonDisabled,
            styleForCheckoutBarButton0(canSubmit),
          ]}
        >
          {({ pressed }) => (
            <Text
              numberOfLines={1}
              style={[
                styles.payButtonText,
                isMobileWeb && styles.mobileWebPayButtonText,
                (pressed || !canSubmit) && styles.payButtonTextPressed,
              ]}
            >
              {checkoutButtonLabel(pending, expired)}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function checkoutButtonLabel(pending: boolean, expired: boolean): string {
  if (pending) return "Memproses…";
  if (expired) return "Waktu habis";
  return "Lanjut Bayar";
}
