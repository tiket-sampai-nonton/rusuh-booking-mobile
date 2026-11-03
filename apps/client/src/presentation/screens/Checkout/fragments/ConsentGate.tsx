/**
 * RBT-092 — V2 Brutalist Mono Consent Gate
 *
 * Inline NIK/data-processing consent gate (D7.1).
 * Login is optional (D8.5), so a guest consents HERE before any NIK is submitted.
 * PROTOTYPE MATCH: 2px borders, no rounded corners, uppercase label
 */
import { Pressable, Text, View } from "react-native";

import { v2Colors, interFonts } from "@presentation/theme";

import type { ConsentGateProps } from "../interface";

export function ConsentGate({ checked, onToggle }: ConsentGateProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel="Saya menyetujui pemrosesan data sesuai Kebijakan Privasi"
      onPress={() => onToggle(!checked)}
      testID="checkout-consent"
      style={{
        marginTop: 16,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 14,
        borderWidth: 2,
        borderColor: v2Colors.ink,
        backgroundColor: v2Colors.ground,
        padding: 20,
      }}
    >
      {/* Checkbox */}
      <View
        style={{
          marginTop: 2,
          width: 24,
          height: 24,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: v2Colors.ink,
          backgroundColor: checked ? v2Colors.ink : v2Colors.ground,
        }}
      >
        {checked ? (
          <Text
            style={{
              fontSize: 14,
              color: v2Colors.ground,
              fontFamily: interFonts.bold,
            }}
            accessibilityElementsHidden
          >
            ✓
          </Text>
        ) : null}
      </View>
      {/* Label */}
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          lineHeight: 20,
          color: v2Colors.ink,
          fontFamily: interFonts.regular,
        }}
      >
        Saya menyetujui pemrosesan data (termasuk NIK) sesuai{" "}
        <Text style={{ fontFamily: interFonts.bold, textDecorationLine: "underline" }}>
          Kebijakan Privasi
        </Text>
        . NIK dipakai untuk validasi tiket dan tidak disimpan di perangkat.
      </Text>
    </Pressable>
  );
}
