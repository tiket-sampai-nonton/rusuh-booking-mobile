import { useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { headerInsetStyle, styles } from "../../style";

export function Header() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, headerInsetStyle(insets.top)]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Beranda Rusuh Tiket"
        onPress={() => router.push("/" as Href)}
      >
        <Text style={styles.logo}>
          Rusuh<Text style={styles.logoAccent}>Tiket</Text>
        </Text>
      </Pressable>
    </View>
  );
}
