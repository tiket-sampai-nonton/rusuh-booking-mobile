/**  brutalist sticky checkout bar — total + "Bayar Sekarang" (prototype 08-payment.html). */
import { Pressable, Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";
import { designColors } from "@presentation/theme";
import { ExternalLinkIcon } from "@presentation/components/ArrowIcon";

import type { PaymentBarProps } from "../../interface";
import { paymentBar } from "../../style";
import { componentStyles } from "./style";
import { styleForPaymentBarView0, styleForPaymentBarPressable1, styleForPaymentBarText2 } from './style';


export function PaymentBar({
  amountMinor,
  canPay,
  pending,
  resumeLabel,
  expired,
  errorMessage,
  onPay,
  bottomInset,
}: PaymentBarProps) {
  return (
    <View
      style={[paymentBar(bottomInset), styleForPaymentBarView0()]}
      className="px-5 pt-4"
    >
      {errorMessage ? (
        <Text
          className="mb-2 text-center text-xs font-bold"
          style={componentStyles.elementColor0}
          accessibilityLiveRegion="polite"
        >
          {errorMessage}
        </Text>
      ) : null}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xs uppercase tracking-tag" style={componentStyles.elementColor1}>Total Bayar</Text>
          <Text className="text-xl font-extrabold" style={componentStyles.elementColor2}>{minorToIDR(amountMinor)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bayar Sekarang"
          accessibilityState={{ disabled: !canPay }}
          disabled={!canPay}
          onPress={onPay}
          testID="pay-now"
          className="flex-row items-center gap-3 py-3.5 pl-6 pr-6"
          style={styleForPaymentBarPressable1(canPay)}
        >
          <Text
            className="text-md font-extrabold uppercase"
            style={styleForPaymentBarText2(canPay)}
          >
            {paymentButtonLabel(pending, expired, resumeLabel)}
          </Text>
          {canPay ? (
            <ExternalLinkIcon color={designColors.ink} size={16} />
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

function paymentButtonLabel(pending: boolean, expired: boolean, resumeLabel?: string): string {
  if (pending) return "Memproses…";
  if (expired) return "Waktu habis";
  return resumeLabel ?? "Bayar Sekarang";
}
