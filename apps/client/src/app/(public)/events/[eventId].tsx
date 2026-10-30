import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

// Public route `/events/[eventId]` (event detail). Skeleton placeholder — real
// detail screen lands in a later RBT. Routing-only, no API calls.
export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold text-brand" accessibilityRole="header">
        Event Detail — /events/{eventId} (RBT-002)
      </Text>
    </View>
  );
}
