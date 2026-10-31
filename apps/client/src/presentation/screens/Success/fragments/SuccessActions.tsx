/** Two-button actions row — download (print) + home (prototype `.actions`). */
import { Pressable, Text, View } from "react-native";

import type { SuccessActionsProps } from "../interface";

export function SuccessActions({ onDownload, onHome }: SuccessActionsProps) {
  return (
    <View className="mt-6 flex-row gap-2.5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Unduh E-Tiket"
        onPress={onDownload}
        testID="success-download"
        className="flex-1 flex-row items-center justify-center gap-2 rounded-pill bg-white py-4"
      >
        <Text className="text-sm font-bold text-ink">⬇ Unduh E-Tiket</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ke Beranda"
        onPress={onHome}
        testID="success-home"
        className="flex-1 flex-row items-center justify-center rounded-pill border border-white/[0.16] bg-white/[0.08] py-4"
      >
        <Text className="text-sm font-bold text-white">Ke Beranda</Text>
      </Pressable>
    </View>
  );
}
