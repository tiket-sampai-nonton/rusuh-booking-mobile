/**
 * SnapSimulator screen styles — extracted from inline `style={{…}}` so the JSX
 * carries none (refactor rule). V2 Brutalist Mono: square black logo mark.
 */
import { StyleSheet } from "react-native";

import { v2 } from "@presentation/theme";

export const snapStyles = StyleSheet.create({
  scrollContent: { flexGrow: 1, justifyContent: "flex-start", padding: 0 },
  logoMark: {
    width: 40,
    height: 40,
    backgroundColor: v2.ink,
  },
  logoArrow: { fontSize: 18, fontWeight: "900", color: v2.ground },
  eyebrow: { letterSpacing: 2.5 },
  heading: { letterSpacing: -0.5 },
});
