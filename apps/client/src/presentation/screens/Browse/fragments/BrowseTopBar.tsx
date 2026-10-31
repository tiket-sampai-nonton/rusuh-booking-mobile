/** Browse top bar — brand + back to home (prototype browse.html header). */
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandMark } from "@presentation/components/BrandMark";

import type { BrowseTopBarProps } from "../interface";
import { browseTopBar } from "../style";

export function BrowseTopBar({ onHome }: BrowseTopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center justify-between border-b border-line bg-card/90 px-5 pb-3"
      style={browseTopBar(insets.top)}
    >
      <BrandMark />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali ke beranda"
        onPress={onHome}
        testID="browse-home"
      >
        <Text className="text-sm font-semibold text-muted-foreground">← Beranda</Text>
      </Pressable>
    </View>
  );
}
