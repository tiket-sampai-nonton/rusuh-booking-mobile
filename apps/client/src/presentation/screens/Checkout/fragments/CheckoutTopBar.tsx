/**
 * V2 Brutalist Mono checkout topbar (RBT-092): back + server-driven hold timer.
 *
 * Prototype 07 `.topbar` / `.timer`: hard-bordered white bar + a square timer
 * badge that inverts to red when the countdown is low/expired. The timer value
 * is SERVER-DRIVEN (useServerCountdown upstream) — never a client constant.
 * Same props/testID wiring — restyle only.
 */
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatCountdown } from "@domain/services/date-format";
import { v2 } from "@presentation/theme";

import type { CheckoutTopBarProps } from "../interface";

export function CheckoutTopBar({ remainingMs, warn, expired, onBack }: CheckoutTopBarProps) {
  const insets = useSafeAreaInsets();
  const alarm = warn || expired;
  return (
    <View style={{ paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: v2.ground,
          borderBottomWidth: 2,
          borderBottomColor: v2.ink,
          paddingHorizontal: 20,
          paddingVertical: 14,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onBack}
          testID="checkout-back"
        >
          <Text style={{ color: v2.ink }} className="text-sm font-v2 font-bold uppercase">
            ← Kembali
          </Text>
        </Pressable>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 9,
            borderWidth: 2,
            borderColor: v2.accent,
            backgroundColor: alarm ? v2.accent : v2.ground,
            paddingHorizontal: 14,
            paddingVertical: 7,
          }}
        >
          <View
            style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: alarm ? v2.ground : v2.accent }}
          />
          <Text
            style={{ color: alarm ? v2.ground : v2.accent, fontFamily: "JetBrains Mono" }}
            className="text-md font-v2 font-black"
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
