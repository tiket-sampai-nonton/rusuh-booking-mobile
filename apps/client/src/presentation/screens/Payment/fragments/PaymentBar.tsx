/** V2 brutalist sticky checkout bar — total + "Bayar Sekarang" (prototype 08-payment.html). */
import { Pressable, Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";
import { v2, v2Border } from "@presentation/theme";

import type { PaymentBarProps } from "../interface";
import { paymentBar } from "../style";

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
      style={[paymentBar(bottomInset), { borderTopWidth: v2Border.base, borderTopColor: v2.accent }]}
      className="px-5 pt-4"
    >
      {errorMessage ? (
        <Text
          className="mb-2 text-center text-xs font-bold"
          style={{ color: v2.accent }}
          accessibilityLiveRegion="polite"
        >
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
          className="flex-row items-center gap-3 py-3.5 pl-6 pr-6"
          style={{ backgroundColor: canPay ? v2.ground : "#444444" }}
        >
          <Text
            className="text-md font-extrabold uppercase"
            style={{ color: canPay ? v2.ink : "#999999", letterSpacing: 0.5 }}
          >
            {pending
              ? "Memproses…"
              : expired
                ? "Waktu habis"
                : (resumeLabel ?? "Bayar Sekarang")}
          </Text>
          {canPay ? (
            <Text className="text-sm" style={{ color: v2.ink }} accessibilityElementsHidden>
              ↗
            </Text>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}
