/** V2 brutalist hold banner + order-summary panel (prototype 08-payment.html). */
import { Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";
import { v2, v2Border } from "@presentation/theme";

import type { PaymentSummaryProps } from "../interface";

export function PaymentHoldBanner() {
  return (
    <View
      className="mb-6 flex-row items-center gap-2.5 px-3.5 py-3"
      style={{ backgroundColor: v2.ink }}
    >
      <Text className="text-sm text-white" accessibilityElementsHidden>
        🔒
      </Text>
      <Text className="flex-1 text-xs font-semibold text-white">
        Stok kamu sudah di-hold. Selesaikan pembayaran sebelum waktu habis.
      </Text>
    </View>
  );
}

export function PaymentSummary({ bookingId, amountMinor }: PaymentSummaryProps) {
  return (
    <View
      className="mb-4"
      style={{ borderWidth: v2Border.base, borderColor: v2.ink, backgroundColor: v2.ground }}
    >
      <Text
        className="px-5 py-3.5 text-2xs font-extrabold uppercase"
        style={{
          color: v2.gray,
          letterSpacing: 2,
          borderBottomWidth: v2Border.base,
          borderBottomColor: v2.ink,
        }}
      >
        Ringkasan Pesanan
      </Text>
      <View className="p-5">
        <Text className="text-base font-extrabold uppercase" style={{ color: v2.ink, letterSpacing: -0.5 }}>
          Pesanan {bookingId}
        </Text>
        {/* NO "biaya layanan" line — total is exactly amountMinor (D10.1). */}
        <View
          className="mt-4 flex-row items-center justify-between pt-3"
          style={{ borderTopWidth: 1, borderTopColor: v2.field }}
        >
          <Text className="text-base font-extrabold" style={{ color: v2.ink }}>
            Total
          </Text>
          <Text className="text-lg font-extrabold" style={{ color: v2.ink }} testID="payment-total">
            {minorToIDR(amountMinor)}
          </Text>
        </View>
      </View>
    </View>
  );
}
