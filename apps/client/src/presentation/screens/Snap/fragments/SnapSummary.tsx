/** V2 brutalist SNAP order summary (Order ID / Metode / Total) — prototype 08a-snap.html. */
import { Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";
import { v2, v2Border } from "@presentation/theme";

import type { SnapSummaryProps, SnapSummaryRowProps } from "../interface";

function SummaryRow({ label, value, last }: SnapSummaryRowProps & { last?: boolean }) {
  return (
    <View
      className="flex-row items-center justify-between gap-3.5 py-3"
      style={last ? undefined : { borderBottomWidth: 1, borderBottomColor: "#e0e0e0" }}
    >
      <Text className="text-xs" style={{ color: v2.gray }}>
        {label}
      </Text>
      <Text className="flex-1 text-right text-xs font-bold" style={{ color: v2.ink }}>
        {value}
      </Text>
    </View>
  );
}

export function SnapSummary({ bookingId, method, amountMinor }: SnapSummaryProps) {
  return (
    <View
      className="my-7 px-5 py-1"
      style={{ backgroundColor: "#f9f9f9", borderWidth: v2Border.base, borderColor: v2.ink }}
    >
      <SummaryRow label="Order ID" value={bookingId} />
      <SummaryRow label="Metode" value={method ?? "SNAP"} />
      <SummaryRow label="Total" value={minorToIDR(amountMinor)} last />
    </View>
  );
}
