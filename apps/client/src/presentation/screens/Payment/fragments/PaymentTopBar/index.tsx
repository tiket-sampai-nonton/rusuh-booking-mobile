/**  brutalist topbar: back + blinking payment timer (prototype 08-payment.html). */
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatCountdown } from "@domain/services/date-format";
import { Icon } from "@presentation/components/Icon";
import { designColors } from "@presentation/theme";

import type { PaymentTopBarProps } from "../../interface";
import { paymentStyles, paymentTopBar } from "../../style";
import {
  componentStyles,
  styleForPaymentTopBarView0,
  styleForPaymentTopBarView1,
} from "./style";

export function PaymentTopBar({
  remainingMs,
  warn,
  expired,
  isMobileWeb = false,
  onBack,
}: PaymentTopBarProps) {
  const insets = useSafeAreaInsets();
  const danger = warn || expired;
  return (
    <View
      className="flex-row items-center justify-between px-5 pb-3"
      style={[paymentTopBar(insets.top), styleForPaymentTopBarView0()]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali"
        onPress={onBack}
        testID="payment-back"
      >
        <View className="flex-row items-center gap-1.5">
          <Icon direction="left" color={designColors.ink} />
          {!isMobileWeb && (
            <Text
              className="text-sm font-bold uppercase tracking-tag"
              style={componentStyles.elementColor0}
            >
              Kembali
            </Text>
          )}
        </View>
      </Pressable>
      <View
        className="flex-row items-center gap-2.25 px-3.5 py-2"
        style={styleForPaymentTopBarView1(danger)}
      >
        <View
          style={[
            paymentStyles.timerDot,
            { backgroundColor: designColors.ground },
          ]}
        />
        <Text
          className="text-md font-extrabold"
          style={[paymentStyles.tabularNum, { color: designColors.ground }]}
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
