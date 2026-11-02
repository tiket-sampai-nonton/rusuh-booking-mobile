/**
 * SnapSimulator screen styles — extracted from inline `style={{…}}` so the JSX
 * carries none (refactor rule). Values are 1:1 with the prototype snap.html.
 */
import { StyleSheet } from "react-native";

import { brand } from "@presentation/theme";

export const snapStyles = StyleSheet.create({
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: brand.red,
  },
  logoArrow: { fontSize: 14, color: "#fff" },
  eyebrow: { letterSpacing: 1.5 },
  heading: { letterSpacing: -1 },
});
