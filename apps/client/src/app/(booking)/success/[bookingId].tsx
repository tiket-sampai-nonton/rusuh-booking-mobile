import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

// Booking route `/success/[bookingId]` (confirmed ticket + QR). Skeleton
// placeholder — real success/QR screen lands in a later RBT. Routing-only.
export default function SuccessScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold text-brand" accessibilityRole="header">
        Success — /success/{bookingId} (RBT-002)
      </Text>
    </View>
  );
}
