/** Sticky topbar: back + blinking hold timer (prototype detail.html .topbar). */
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatCountdown } from "@domain/services/date-format";

import type { CheckoutTopBarProps } from "../interface";
import { checkoutStyles, checkoutTopBar } from "../style";

export function CheckoutTopBar({ remainingMs, warn, expired, onBack }: CheckoutTopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center justify-between border-b border-line bg-card/90 px-5 pb-3"
      style={checkoutTopBar(insets.top)}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali"
        onPress={onBack}
        testID="checkout-back"
      >
        <Text className="text-sm font-semibold text-muted-foreground">← Kembali</Text>
      </Pressable>
      <View
        className={`flex-row items-center gap-2.25 rounded-pill border px-3.5 py-2 ${
          warn || expired ? "border-error/40 bg-error/[0.14]" : "border-error/20 bg-error/[0.08]"
        }`}
      >
        <View style={checkoutStyles.timerDot} className="bg-brand" />
        <Text
          className="text-md font-extrabold text-brand"
          accessibilityLabel={`Sisa waktu ${formatCountdown(remainingMs)}`}
          accessibilityLiveRegion="polite"
          testID="checkout-timer"
        >
          {formatCountdown(remainingMs)}
        </Text>
      </View>
    </View>
  );
}
