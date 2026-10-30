import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

// Booking route `/payment/[bookingId]` (mock-first payment attempt). Skeleton
// placeholder — real payment flow lands in a later RBT. Routing-only.
export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold text-brand" accessibilityRole="header">
        Payment — /payment/{bookingId} (RBT-002)
      </Text>
    </View>
  );
}
