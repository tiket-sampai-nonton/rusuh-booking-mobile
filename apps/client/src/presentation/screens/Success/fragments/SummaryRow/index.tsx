import { Text, View } from "react-native";

export interface SummaryRowProps {
  readonly label: string;
  readonly value: string;
  readonly isMobileWeb?: boolean;
}

export function SummaryRow({
  label,
  value,
  isMobileWeb = false,
}: SummaryRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-3.5 py-1">
      <Text
        className={
          isMobileWeb
            ? "text-xs text-muted-foreground"
            : "text-xs text-white/60"
        }
      >
        {label}
      </Text>
      <Text
        className={
          isMobileWeb
            ? "flex-1 text-right text-sm font-bold text-foreground"
            : "flex-1 text-right text-sm font-bold text-white"
        }
      >
        {value}
      </Text>
    </View>
  );
}
