/** V2 brutalist History loading + empty states (prototype 04-my-tickets). */
import { ActivityIndicator, Text, View } from "react-native";

import { v2 } from "@presentation/theme";

import { historyStateStyles } from "../style";

export function HistoryLoading() {
  return (
    <View className="mt-10 items-center" testID="history-loading">
      <ActivityIndicator accessibilityLabel="Memuat event" color={v2.ink} />
    </View>
  );
}

export function HistoryEmpty() {
  return (
    <View
      className="mt-8 p-8"
      style={historyStateStyles.emptyCard}
      testID="history-empty"
      accessibilityLiveRegion="polite"
    >
      <Text className="text-center text-base font-extrabold uppercase" style={{ color: v2.ink }}>
        Belum ada event yang berlalu.
      </Text>
      <Text className="mt-2 text-center text-sm" style={{ color: v2.gray }}>
        Event yang sudah selesai akan muncul di sini.
      </Text>
    </View>
  );
}
