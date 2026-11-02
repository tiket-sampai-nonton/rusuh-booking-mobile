/** History top bar — brand + back to home (prototype header pattern). */
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandMark } from "@presentation/components/BrandMark";

import type { HistoryTopBarProps } from "../interface";
import { historyTopBar } from "../style";

export function HistoryTopBar({ onHome }: HistoryTopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center justify-between border-b border-line bg-card/90 px-5 pb-3"
      style={historyTopBar(insets.top)}
    >
      <BrandMark />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali ke beranda"
        onPress={onHome}
        testID="history-home"
      >
        <Text className="text-sm font-semibold text-muted-foreground">
          ← Beranda
        </Text>
      </Pressable>
    </View>
  );
}
