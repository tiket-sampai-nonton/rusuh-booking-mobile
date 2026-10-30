import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

// Booking route `/checkout/[sessionId]` (attendee + quantity + payment
// method). Skeleton placeholder — real checkout lands in a later RBT.
export default function CheckoutScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold text-brand" accessibilityRole="header">
        Checkout — /checkout/{sessionId} (RBT-002)
      </Text>
    </View>
  );
}
