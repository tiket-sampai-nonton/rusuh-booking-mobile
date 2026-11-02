/**
 * Inline NIK/data-processing consent gate (RBT-052 AC3, D7.1).
 *
 * Login is optional (D8.5), so a guest who never registered consents HERE,
 * inline at checkout, before any NIK is submitted. Logged-in users already
 * consented at registration and never see this (the screen omits it). The
 * checkout is not ready until this is ticked.
 */
import { Pressable, Text, View } from "react-native";

import type { ConsentGateProps } from "../interface";

export function ConsentGate({ checked, onToggle }: ConsentGateProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel="Saya menyetujui pemrosesan data sesuai Kebijakan Privasi"
      onPress={() => onToggle(!checked)}
      testID="checkout-consent"
      className="mt-3 flex-row items-start gap-2.5 rounded-md border border-line bg-card p-3.5"
    >
      <View
        className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${
          checked ? "border-ink bg-ink" : "border-line"
        }`}
      >
        {checked ? (
          <Text className="text-2xs text-white" accessibilityElementsHidden>
            ✓
          </Text>
        ) : null}
      </View>
      <Text className="flex-1 text-xs leading-4 text-foreground">
        Saya menyetujui pemrosesan data (termasuk NIK) sesuai{" "}
        <Text className="font-bold text-brand">Kebijakan Privasi</Text>. NIK
        dipakai untuk validasi tiket dan tidak disimpan di perangkat.
      </Text>
    </Pressable>
  );
}
