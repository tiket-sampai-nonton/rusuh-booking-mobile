import { Text, View } from "react-native";

import { APP_NAME } from "@shared/utils/clamp";

// RBT-001 skeleton home. Real Home (event list) lands in RBT-030.
// Route files stay routing-only; this placeholder renders a shared constant
// to prove the app boots and the alias + NativeWind wiring resolves.
export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-brand" accessibilityRole="header">
        {APP_NAME}
      </Text>
      <Text className="mt-2 text-gray-500">Skeleton — RBT-001</Text>
    </View>
  );
}
