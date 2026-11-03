/**
 * V2 Brutalist Mono Trust Box
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html` (trust content moved to FloatingCTA)
 *
 * This is now a standalone trust section that can be placed in the content area
 * if needed. The inline trust badges are in FloatingCTA.
 *
 * Features:
 * - Simple bordered box with check marks
 * - V2 styling (no rounded corners)
 */
import { Text, View, StyleSheet } from "react-native";

import { interFonts } from "@presentation/theme/fonts";
import {
  v2Borders,
  v2Colors,
  v2FontSizes,
  v2SpacingSemantic,
} from "@presentation/theme/v2-tokens";

const TRUST_LINES = [
  "Tiket resmi & terverifikasi",
  "Antrean adil (FCFS)",
  "E-ticket langsung ke gate",
  "Refund sesuai ketentuan penyelenggara",
] as const;

export function TrustBox() {
  return (
    <View style={trustStyles.container}>
      {TRUST_LINES.map((text) => (
        <View key={text} style={trustStyles.row}>
          <Text style={trustStyles.check} accessibilityElementsHidden>
            ✓
          </Text>
          <Text style={trustStyles.text}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

const trustStyles = StyleSheet.create({
  container: {
    padding: v2SpacingSemantic.m,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    borderStyle: "dashed",
    gap: v2SpacingSemantic.s,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: v2SpacingSemantic.s,
  },
  check: {
    fontFamily: interFonts.black,
    fontSize: v2FontSizes.s,
    color: v2Colors.success, // #00aa00 per Design Palette Guide
    lineHeight: v2FontSizes.s * 1.5,
  },
  text: {
    flex: 1,
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.s,
    color: v2Colors.inkMuted,
    lineHeight: v2FontSizes.s * 1.5,
  },
});
