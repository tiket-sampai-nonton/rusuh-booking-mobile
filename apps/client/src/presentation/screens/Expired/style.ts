/** Expired screen styles — extracted from inline `style={{…}}` (refactor rule). */
import { StyleSheet } from "react-native";

import { brand } from "@presentation/theme";

export const expiredStyles = StyleSheet.create({
  glyph: {
    width: 84,
    height: 84,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    backgroundColor: "rgba(232,131,12,0.16)",
    borderWidth: 1,
    borderColor: "rgba(232,131,12,0.4)",
  },
  glyphText: { fontSize: 36 },
  title: { letterSpacing: -0.5, textAlign: "center" },
  sub: { maxWidth: 320 },
  ctaPin: { width: 30, height: 30, borderRadius: 999, backgroundColor: brand.red },
  ctaPinText: { fontSize: 14, color: "#fff" },
});

/** Safe-area padding is runtime (insets), so it stays a factory, not a static. */
export const expiredContainer = (top: number, bottom: number) => ({
  paddingTop: top + 34,
  paddingBottom: bottom + 34,
});
