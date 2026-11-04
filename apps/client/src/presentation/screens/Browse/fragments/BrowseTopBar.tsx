/**
 * V2 Brutalist Mono Browse top bar (RBT-089).
 *
 * Prototype 05-browse `.header`: fixed white bar with a hard 2px bottom border,
 * uppercase wordmark + a "← Beranda" back link. Pure black/white, no shadow, no
 * rounding. Same props/testID wiring as the V5 version — restyle only.
 */
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowIcon } from "@presentation/components/ArrowIcon";

import { v2 } from "@presentation/theme";

import type { BrowseTopBarProps } from "../interface";

export function BrowseTopBar({ onHome }: BrowseTopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: v2.ground,
          borderBottomWidth: 2,
          borderBottomColor: v2.ink,
          paddingHorizontal: 20,
          paddingVertical: 14,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{ color: v2.ink, letterSpacing: 0.5 }}
          className="text-lg font-v2 font-black uppercase"
        >
          Rusuh Tiket
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali ke beranda"
          onPress={onHome}
          testID="browse-home"
        >
          <View className="flex-row items-center gap-1.5"><ArrowIcon direction="left" color={v2.ink} /><Text style={{ color: v2.ink }} className="text-sm font-v2 font-bold uppercase">Beranda</Text></View>
        </Pressable>
      </View>
    </View>
  );
}
