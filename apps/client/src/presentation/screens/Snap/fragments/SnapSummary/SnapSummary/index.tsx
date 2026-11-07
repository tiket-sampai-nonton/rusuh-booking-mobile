import { View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import type { SnapSummaryProps } from "../../../interface";
import { SummaryRow } from "../SummaryRow";
import { snapSummaryStyles } from "../style";

export function SnapSummary({
  bookingId,
  method,
  amountMinor,
}: SnapSummaryProps) {
  return (
    <View className="my-7 px-5 py-1" style={snapSummaryStyles.container}>
      <SummaryRow label="Nomor Pesanan" value={bookingId} />
      <SummaryRow label="Metode" value={method ?? "SNAP"} />
      <SummaryRow label="Total" value={minorToIDR(amountMinor)} last />
    </View>
  );
}
