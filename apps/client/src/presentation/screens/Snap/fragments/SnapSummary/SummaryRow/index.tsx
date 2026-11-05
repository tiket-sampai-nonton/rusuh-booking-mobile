import { Text, View } from "react-native";

import { snapSummaryStyles } from "../style";

export interface SummaryRowProps {
  readonly label: string;
  readonly value: string;
  readonly last?: boolean;
}

export function SummaryRow({ label, value, last = false }: SummaryRowProps) {
  return (
    <View
      className="flex-row items-center justify-between gap-3.5 py-3"
      style={!last && snapSummaryStyles.rowDivider}
    >
      <Text className="text-xs" style={snapSummaryStyles.label}>
        {label}
      </Text>
      <Text className="flex-1 text-right text-xs font-bold" style={snapSummaryStyles.value}>
        {value}
      </Text>
    </View>
  );
}
