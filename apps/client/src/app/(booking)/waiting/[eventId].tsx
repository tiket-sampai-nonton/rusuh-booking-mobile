import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

// Booking route `/waiting/[eventId]` (queue waiting room). Skeleton
// placeholder — real queue/timer screen lands in a later RBT. Routing-only.
export default function WaitingScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold text-brand" accessibilityRole="header">
        Waiting — /waiting/{eventId} (RBT-002)
      </Text>
    </View>
  );
}
