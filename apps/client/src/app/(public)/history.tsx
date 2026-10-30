import { Text, View } from "react-native";

// Public route `/history` (booking history). Listed under (public) in
// ARCHITECTURE §3. Skeleton placeholder — real list lands in a later RBT.
export default function HistoryScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold text-brand" accessibilityRole="header">
        History — /history (RBT-002)
      </Text>
    </View>
  );
}
