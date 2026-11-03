/** V2 brutalist topbar: back + blinking payment timer (prototype 08-payment.html). */
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatCountdown } from "@domain/services/date-format";
import { v2, v2Border } from "@presentation/theme";

import type { PaymentTopBarProps } from "../interface";
import { paymentStyles, paymentTopBar } from "../style";

export function PaymentTopBar({ remainingMs, warn, expired, onBack }: PaymentTopBarProps) {
  const insets = useSafeAreaInsets();
  const danger = warn || expired;
  return (
    <View
      className="flex-row items-center justify-between px-5 pb-3"
      style={[
        paymentTopBar(insets.top),
        { backgroundColor: v2.ground, borderBottomWidth: v2Border.base, borderBottomColor: v2.ink },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali"
        onPress={onBack}
        testID="payment-back"
      >
        <Text className="text-sm font-bold uppercase tracking-tag" style={{ color: v2.ink }}>
          ← Kembali
        </Text>
      </Pressable>
      <View
        className="flex-row items-center gap-2.25 px-3.5 py-2"
        style={{ backgroundColor: danger ? v2.accent : v2.ink }}
      >
        <View style={paymentStyles.timerDot} className="bg-white" />
        <Text
          className="text-md font-extrabold text-white"
          style={paymentStyles.tabularNum}
          accessibilityLabel={`Sisa waktu pembayaran ${formatCountdown(remainingMs)}`}
          accessibilityLiveRegion="polite"
          testID="payment-timer"
        >
          {formatCountdown(remainingMs)}
        </Text>
      </View>
    </View>
  );
}
