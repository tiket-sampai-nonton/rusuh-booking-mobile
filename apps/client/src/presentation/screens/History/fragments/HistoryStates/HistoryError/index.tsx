import { Text, View } from "react-native";

import { historyStateStyles, historyStyles } from "../../../style";

export interface HistoryErrorProps {
  readonly message?: string;
}

export function HistoryError({ message }: HistoryErrorProps) {
  return (
    <View style={[historyStyles.main, historyStateStyles.main]}>
      <View
        style={historyStateStyles.errorCard}
        testID="history-error"
        accessibilityLiveRegion="polite"
      >
        <Text style={historyStateStyles.errorTitle}>Gagal Memuat Event</Text>
        <Text style={historyStateStyles.errorText}>
          {message || "Terjadi kesalahan. Silakan coba lagi."}
        </Text>
      </View>
    </View>
  );
}
