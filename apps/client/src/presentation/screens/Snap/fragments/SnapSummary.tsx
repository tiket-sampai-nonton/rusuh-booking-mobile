/** SNAP order summary (Order ID / Metode / Total) — prototype snap.html. */
import { Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import type { SnapSummaryProps, SnapSummaryRowProps } from "../interface";

function SummaryRow({ label, value }: SnapSummaryRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-3.5">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-right text-xs font-bold text-foreground">{value}</Text>
    </View>
  );
}

export function SnapSummary({ bookingId, method, amountMinor }: SnapSummaryProps) {
  return (
    <View className="my-5.5 gap-2.75 rounded-xl bg-background p-4">
      <SummaryRow label="Order ID" value={bookingId} />
      <SummaryRow label="Metode" value={method ?? "SNAP"} />
      <SummaryRow label="Total" value={minorToIDR(amountMinor)} />
    </View>
  );
}
