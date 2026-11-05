import { Text, View } from "react-native";

export interface SummaryRowProps {
  readonly label: string;
  readonly value: string;
}

export function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-3.5 py-1">
      <Text className="text-xs text-white/60">{label}</Text>
      <Text className="flex-1 text-right text-sm font-bold text-white">{value}</Text>
    </View>
  );
}
