/** Sticky topbar: back + blinking payment timer (prototype payment.html). */
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatCountdown } from "@domain/services/date-format";

import type { PaymentTopBarProps } from "../interface";
import { paymentStyles, paymentTopBar } from "../style";

export function PaymentTopBar({ remainingMs, warn, expired, onBack }: PaymentTopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center justify-between border-b border-line bg-card/90 px-5 pb-3"
      style={paymentTopBar(insets.top)}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali"
        onPress={onBack}
        testID="payment-back"
      >
        <Text className="text-sm font-semibold text-muted-foreground">← Kembali</Text>
      </Pressable>
      <View
        className={`flex-row items-center gap-2.25 rounded-pill border px-3.5 py-2 ${
          warn || expired ? "border-error/40 bg-error/[0.16]" : "border-error/20 bg-error/[0.08]"
        }`}
      >
        <View style={paymentStyles.timerDot} className="bg-brand" />
        <Text
          className="text-md font-extrabold text-brand"
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
