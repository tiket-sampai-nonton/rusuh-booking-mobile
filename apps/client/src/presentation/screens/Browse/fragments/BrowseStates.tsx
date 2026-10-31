/** Browse loading + empty states (prototype browse.html). */
import { ActivityIndicator, Text, View } from "react-native";

export function BrowseLoading() {
  return (
    <View className="mt-10 items-center" testID="browse-loading">
      <ActivityIndicator accessibilityLabel="Memuat event" color="#e8320c" />
    </View>
  );
}

export function BrowseEmpty() {
  return (
    <View className="mt-8 rounded-2xl border border-dashed border-line p-8" testID="browse-empty">
      <Text className="text-center text-base font-bold text-foreground">
        Tidak ada event yang cocok
      </Text>
      <Text className="mt-1 text-center text-sm text-muted-foreground">
        Coba ubah filter genre atau waktu, atau kembali ke beranda.
      </Text>
    </View>
  );
}
