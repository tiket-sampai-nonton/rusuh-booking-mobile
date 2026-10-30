import { Text, View } from "react-native";

// Public route `/browse` (URL-driven filtered event results). Skeleton
// placeholder — real filtering lands in a later RBT. Routing-only, no logic.
export default function BrowseScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold text-brand" accessibilityRole="header">
        Browse — /browse (RBT-002)
      </Text>
    </View>
  );
}
