import { Text, View } from "react-native";

import { styles } from "../../style";

export function NetworkStatusBar({
  isOffline,
  isReconnected,
}: {
  readonly isOffline: boolean;
  readonly isReconnected: boolean;
}) {
  if (!isOffline && !isReconnected) return null;

  return (
    <View
      style={[
        styles.networkStatus,
        isReconnected && styles.networkStatusReconnected,
      ]}
      testID="waiting-network-status"
    >
      <Text style={styles.networkStatusText}>
        {isReconnected
          ? "Koneksi tersambung kembali. Memperbarui antrean…"
          : "Koneksi terputus. Posisi antrean Anda tetap tersimpan…"}
      </Text>
    </View>
  );
}
