/**
 * RBT-092 —  Brutalist Mono Consent Gate
 *
 * Inline NIK/data-processing consent gate (D7.1).
 * Login is optional (D8.5), so a guest consents HERE before any NIK is submitted.
 * PROTOTYPE MATCH: 2px borders, no rounded corners, uppercase label
 */
import { Pressable, Text, View } from "react-native";

import { designColors } from "@presentation/theme";
import { CheckIcon } from "@presentation/components/Icon";

import type { ConsentGateProps } from "../../interface";
import { componentStyles, styleForConsentGateView0 } from "./style";

export function ConsentGate({
  checked,
  onToggle,
  onOpenPrivacy,
  errorMessage,
}: ConsentGateProps) {
  return (
    <View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        aria-checked={checked}
        accessibilityLabel="Saya menyetujui pemrosesan data sesuai Kebijakan Privasi"
        onPress={() => onToggle(!checked)}
        testID="checkout-consent"
        style={componentStyles.elementMarginTop0}
      >
        <View style={styleForConsentGateView0(checked)}>
          {checked ? <CheckIcon color={designColors.ground} size={15} /> : null}
        </View>
        <Text style={componentStyles.elementFlex1}>
          Saya menyetujui pemrosesan data (termasuk NIK) sesuai Kebijakan
          Privasi. NIK dipakai untuk validasi tiket dan tidak disimpan di
          perangkat.
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Baca Kebijakan Privasi"
        onPress={onOpenPrivacy}
        testID="checkout-privacy-link"
      >
        <Text style={componentStyles.elementFontFamily2}>
          Baca Kebijakan Privasi
        </Text>
      </Pressable>
      {errorMessage ? (
        <Text
          style={componentStyles.validationError}
          accessibilityRole="alert"
          testID="checkout-consent-error"
        >
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}
