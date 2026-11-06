import { Text, View } from "react-native";

import type { HomeErrorProps } from "../../../interface";

export function HomeError({ message }: HomeErrorProps) {
  return (
    <View
      className="m-5 rounded-2xl border border-line p-6"
      testID="home-error"
      accessibilityLiveRegion="polite"
    >
      <Text className="text-base font-bold text-error">Gagal memuat event</Text>
      <Text className="mt-1 text-sm text-muted-foreground">
        {message || "Terjadi kesalahan. Silakan coba lagi."}
      </Text>
    </View>
  );
}
