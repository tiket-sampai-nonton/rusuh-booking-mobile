/** EventDetail loading + error states (prototype event.html). */
import { ActivityIndicator, Text, View } from "react-native";

import { DetailBackground, MiniNav } from "./DetailChrome";

export function DetailLoading({ onBack }: { readonly onBack: () => void }) {
  return (
    <DetailBackground testID="detail-loading">
      <MiniNav onBack={onBack} />
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator accessibilityLabel="Memuat detail event" color="#fff" />
      </View>
    </DetailBackground>
  );
}

export function DetailError({
  message,
  onBack,
}: {
  readonly message?: string;
  readonly onBack: () => void;
}) {
  return (
    <DetailBackground testID="detail-error">
      <MiniNav onBack={onBack} />
      <View className="flex-1 items-center justify-center p-6" accessibilityLiveRegion="polite">
        <Text className="text-base font-bold text-white" accessibilityRole="header">
          Gagal memuat event
        </Text>
        <Text className="mt-1 text-sm text-white/60">
          {message || "Event tidak ditemukan."}
        </Text>
      </View>
    </DetailBackground>
  );
}
