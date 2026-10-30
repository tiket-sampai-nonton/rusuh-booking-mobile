import { Text, View } from "react-native";

import { APP_NAME } from "@shared/utils/clamp";

// Public route `/` (Home). Skeleton placeholder — RBT-030 builds the real
// event list. Route files stay routing-only; this renders a shared constant to
// prove the app boots and the alias + NativeWind wiring resolves.
export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-brand" accessibilityRole="header">
        {APP_NAME}
      </Text>
      <Text className="mt-2 text-gray-500">Home — / (RBT-002)</Text>
    </View>
  );
}
