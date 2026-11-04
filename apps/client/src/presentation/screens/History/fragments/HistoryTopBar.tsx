/**
 * V2 brutalist History top bar — DEPRECATED in favor of V2Header.
 *
 * Keeping for backwards compatibility, but the main History screen now uses V2Header.
 */
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandMark } from "@presentation/components/BrandMark";
import { ArrowIcon } from "@presentation/components/ArrowIcon";
import { v2Colors, v2Borders, interFonts } from "@presentation/theme";

import type { HistoryTopBarProps } from "../interface";

export function HistoryTopBar({ onHome }: HistoryTopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 12,
        },
      ]}
    >
      <BrandMark />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali ke beranda"
        onPress={onHome}
        testID="history-home"
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><ArrowIcon direction="left" /><Text style={styles.backText}>Beranda</Text></View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: v2Colors.ground,
    borderBottomWidth: v2Borders.standard,
    borderBottomColor: v2Colors.ink,
  },
  backText: {
    fontSize: 14,
    fontFamily: interFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 0.56,
    color: v2Colors.ink,
  },
});
