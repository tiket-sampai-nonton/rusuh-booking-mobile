/** Dark sticky checkout bar — total + "Bayar Sekarang" (prototype payment.html). */
import { Pressable, Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import type { PaymentBarProps } from "../interface";
import { paymentBar } from "../style";

export function PaymentBar({
  amountMinor,
  canPay,
  pending,
  expired,
  errorMessage,
  onPay,
  bottomInset,
}: PaymentBarProps) {
  return (
    <View style={paymentBar(bottomInset)} className="px-5 pt-4">
      {errorMessage ? (
        <Text className="mb-2 text-center text-xs text-error-dark" accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      ) : null}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xs uppercase tracking-tag text-white/50">Total Bayar</Text>
          <Text className="text-xl font-extrabold text-white">{minorToIDR(amountMinor)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bayar Sekarang"
          accessibilityState={{ disabled: !canPay }}
          disabled={!canPay}
          onPress={onPay}
          testID="pay-now"
          className={`flex-row items-center gap-3 rounded-pill py-3.5 pl-6 pr-3.5 ${
            canPay ? "bg-brand" : "bg-white/15"
          }`}
        >
          <Text className="text-md font-bold text-white">
            {pending ? "Memproses…" : expired ? "Waktu habis" : "Bayar Sekarang"}
          </Text>
          {canPay ? (
            <View className="h-7 w-7 items-center justify-center rounded-full bg-white/25">
              <Text className="text-sm text-white" accessibilityElementsHidden>↗</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}
