/** Browse top bar — brand + back to home (prototype browse.html header). */
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandMark } from "@presentation/components/BrandMark";
import { TAP_MIN } from "@shared/utils/tap-target";

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
        // RBT-090: ≥44pt touch target (WCAG 2.5.5) without changing the label.
        style={{ minHeight: TAP_MIN, justifyContent: "center" }}
      >
        <Text className="text-sm font-semibold text-muted-foreground">← Beranda</Text>
      </Pressable>
    </View>
  );
}
