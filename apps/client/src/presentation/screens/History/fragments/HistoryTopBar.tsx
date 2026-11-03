/** V2 brutalist History top bar — brand + back to home (prototype 04-my-tickets). */
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandMark } from "@presentation/components/BrandMark";
import { v2, v2Border } from "@presentation/theme";

import type { HistoryTopBarProps } from "../interface";
import { historyTopBar } from "../style";

export function HistoryTopBar({ onHome }: HistoryTopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center justify-between px-5 pb-3"
      style={[
        historyTopBar(insets.top),
        { backgroundColor: v2.ground, borderBottomWidth: v2Border.base, borderBottomColor: v2.ink },
      ]}
    >
      <BrandMark />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali ke beranda"
        onPress={onHome}
        testID="history-home"
      >
        <Text className="text-sm font-bold uppercase tracking-tag" style={{ color: v2.ink }}>
          ← Beranda
        </Text>
      </Pressable>
    </View>
  );
}
