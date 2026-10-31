/** Green hold banner + order-summary panel (prototype payment.html). */
import { Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import type { PaymentSummaryProps } from "../interface";

export function PaymentHoldBanner() {
  return (
    <View className="mb-5 flex-row items-center gap-2.5 rounded-lg border border-ok/20 bg-ok/[0.08] px-3.5 py-3">
      <Text className="text-sm" accessibilityElementsHidden>🔒</Text>
      <Text className="flex-1 text-xs font-semibold text-ok">
        Stok kamu sudah di-hold. Selesaikan pembayaran sebelum waktu habis.
      </Text>
    </View>
  );
}

export function PaymentSummary({ bookingId, amountMinor }: PaymentSummaryProps) {
  return (
    <View className="mb-4 rounded-3xl border border-line bg-card p-[7px] shadow-filter">
      <View className="p-4.5">
        <Text className="mb-3.5 text-2xs font-bold uppercase tracking-tag text-muted-foreground">
          Ringkasan Pesanan
        </Text>
        <Text className="text-base font-extrabold text-foreground">Pesanan {bookingId}</Text>
        {/* NO "biaya layanan" line — total is exactly amountMinor (D10.1). */}
        <View className="mt-3.5 flex-row items-center justify-between border-t border-line pt-2.5">
          <Text className="text-base font-extrabold text-foreground">Total</Text>
          <Text className="text-lg font-extrabold text-brand" testID="payment-total">
            {minorToIDR(amountMinor)}
          </Text>
        </View>
      </View>
    </View>
  );
}
