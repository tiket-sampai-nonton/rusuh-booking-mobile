/** History loading + empty states (prototype index.html #historyEmpty). */
import { ActivityIndicator, Text, View } from "react-native";

import { brand } from "@presentation/theme";

export function HistoryLoading() {
  return (
    <View className="mt-10 items-center" testID="history-loading">
      <ActivityIndicator accessibilityLabel="Memuat event" color={brand.red} />
    </View>
  );
}

export function HistoryEmpty() {
  return (
    <View
      className="mt-8 rounded-2xl border border-dashed border-line p-8"
      testID="history-empty"
      accessibilityLiveRegion="polite"
    >
      <Text className="text-center text-base font-bold text-foreground">
        Belum ada event yang berlalu.
      </Text>
      <Text className="mt-1 text-center text-sm text-muted-foreground">
        Event yang sudah selesai akan muncul di sini.
      </Text>
    </View>
  );
}
