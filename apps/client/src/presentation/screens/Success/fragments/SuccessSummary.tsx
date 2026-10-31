/** Order summary (Order ID / qty / total / masked NIK) — prototype success.html. */
import { Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import type { SuccessSummaryProps, SuccessSummaryRowProps } from "../interface";

function Row({ label, value }: SuccessSummaryRowProps) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-sm text-white/60">{label}</Text>
      <Text className="text-sm font-bold text-white">{value}</Text>
    </View>
  );
}

export function SuccessSummary({ bookingId, ticketCount, amountMinor, buyerNikMasked }: SuccessSummaryProps) {
  return (
    <View className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4" testID="success-summary">
      <Row label="Order ID" value={bookingId} />
      <Row label="Jumlah tiket" value={String(ticketCount)} />
      <Row label="Total pembayaran" value={minorToIDR(amountMinor)} />
      <Row label="NIK pembeli" value={buyerNikMasked ?? "—"} />
    </View>
  );
}
