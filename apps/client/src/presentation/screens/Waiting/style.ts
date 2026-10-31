/** Waiting room styles — extracted from inline `style={{…}}` (refactor rule). */
import { StyleSheet } from "react-native";

export const waitingStyles = StyleSheet.create({
  brandMark: { width: 22, height: 22, borderRadius: 7 },
  brandArrow: { fontSize: 12, color: "#fff" },
  brandText: { fontSize: 15, letterSpacing: -0.3 },
  pillDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: "#ff3b4e" },
  pillLabel: { fontSize: 13 },
  card: { padding: 9 },
  core: { paddingVertical: 34, paddingHorizontal: 28 },
  footnote: { maxWidth: 440 },
  eyebrow: { fontSize: 10, letterSpacing: 2.4 },
  sub: { maxWidth: 300 },
  position: { fontSize: 48, lineHeight: 48, letterSpacing: -1.9 },
  posLabel: { fontSize: 11, letterSpacing: 1.5, marginTop: 6 },
  statLabel: { fontSize: 10 },
});

/** Fixed top-left brand clears the safe-area inset (runtime factory). */
export const waitingBrandTop = (top: number) => ({ top: top + 12 });

/** Leave link spacing + disabled dimming (runtime: depends on `disabled`). */
export const waitingLeave = (disabled: boolean) => ({
  marginTop: 16,
  opacity: disabled ? 0.5 : 1,
});
