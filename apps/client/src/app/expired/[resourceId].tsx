import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

// Top-level route `/expired/[resourceId]` (expired queue session / booking
// hold / payment). Skeleton placeholder — real expiry screen lands later.
export default function ExpiredScreen() {
  const { resourceId } = useLocalSearchParams<{ resourceId: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold text-brand" accessibilityRole="header">
        Expired — /expired/{resourceId} (RBT-002)
      </Text>
    </View>
  );
}
