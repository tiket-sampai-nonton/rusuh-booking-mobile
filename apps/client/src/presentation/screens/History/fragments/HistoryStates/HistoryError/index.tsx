import { Pressable, Text, View } from "react-native";

import { historyStateStyles, historyStyles } from "../../../style";
import { apiErrorMessage } from "@presentation/utils/api-error-message";

export interface HistoryErrorProps {
  readonly error?: unknown;
  readonly onRetry: () => void;
  readonly isRetrying: boolean;
}

export function HistoryError({
  error,
  onRetry,
  isRetrying,
}: HistoryErrorProps) {
  return (
    <View style={[historyStyles.main, historyStateStyles.main]}>
      <View
        style={historyStateStyles.errorCard}
        testID="history-error"
        accessibilityLiveRegion="polite"
      >
        <Text style={historyStateStyles.errorTitle}>Gagal Memuat Event</Text>
        <Text style={historyStateStyles.errorText}>
          {apiErrorMessage(error)}
        </Text>
        <Pressable
          style={{
            alignSelf: "center",
            marginTop: 16,
            borderWidth: 2,
            borderColor: "#000000",
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
          accessibilityRole="button"
          accessibilityLabel="Coba muat arsip event lagi"
          accessibilityState={{ disabled: isRetrying }}
          disabled={isRetrying}
          onPress={onRetry}
          testID="history-retry"
        >
          <Text style={historyStateStyles.errorTitle}>
            {isRetrying ? "Memuat…" : "Coba Lagi"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
