import { Pressable, Text, View } from "react-native";

import type { HomeErrorProps } from "../../../interface";
import { apiErrorMessage } from "@presentation/utils/api-error-message";

export function HomeError({ error, onRetry, isRetrying }: HomeErrorProps) {
  return (
    <View
      className="m-5 rounded-2xl border border-line p-6"
      testID="home-error"
      accessibilityLiveRegion="polite"
    >
      <Text className="text-base font-bold text-error">Gagal memuat event</Text>
      <Text className="mt-1 text-sm text-muted-foreground">
        {apiErrorMessage(error)}
      </Text>
      <Pressable
        className="mt-4 self-start border-2 border-ink px-5 py-3"
        accessibilityRole="button"
        accessibilityLabel="Coba muat event lagi"
        accessibilityState={{ disabled: isRetrying }}
        disabled={isRetrying}
        onPress={onRetry}
        testID="home-retry"
      >
        <Text className="font-bold">
          {isRetrying ? "Memuat…" : "Coba Lagi"}
        </Text>
      </Pressable>
    </View>
  );
}
