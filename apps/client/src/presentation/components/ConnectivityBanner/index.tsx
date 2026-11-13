import { Text, View } from "react-native";

import { designColors } from "@presentation/theme";

export function ConnectivityBanner({
  isOffline,
  justReconnected,
  detail,
}: {
  readonly isOffline: boolean;
  readonly justReconnected: boolean;
  readonly detail?: string;
}) {
  if (!isOffline && !justReconnected) return null;
  const message = isOffline
    ? (detail ??
      "Koneksi terputus. Perjalanan tetap tersimpan; status akan diperiksa saat koneksi kembali.")
    : "Koneksi kembali. Memeriksa status terbaru…";

  return (
    <View
      accessibilityRole="alert"
      testID="connectivity-banner"
      style={{
        borderBottomWidth: 2,
        borderColor: designColors.ink,
        backgroundColor: isOffline ? designColors.ember : designColors.ground,
        paddingHorizontal: 16,
        paddingVertical: 10,
      }}
    >
      <Text
        style={{
          color: isOffline ? designColors.ground : designColors.ink,
          fontWeight: "700",
        }}
      >
        {message}
      </Text>
    </View>
  );
}
