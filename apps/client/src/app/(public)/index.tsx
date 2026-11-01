import { Text, View } from "react-native";

import { LoginButton } from "@presentation/components/auth/LoginButton";
import { APP_NAME } from "@shared/utils/clamp";

// Public route `/` (Home). Skeleton placeholder — RBT-030 builds the real
// event list. Route files stay routing-only; this renders a shared constant to
// prove the app boots and the alias + NativeWind wiring resolves.
//
// RBT-020 wires the "Masuk / Daftar" launcher here (prototype `#accountBtn` in
// the Home nav). Sign-in is OPTIONAL — the launcher gates nothing.
export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-brand" accessibilityRole="header">
        {APP_NAME}
      </Text>
      <Text className="mt-2 text-muted-foreground">Home — / (RBT-002)</Text>
      <View className="mt-6">
        <LoginButton />
      </View>
    </View>
  );
}
