/** Success screen styles — extracted from inline `style={{…}}` (refactor rule). */
import { StyleSheet } from "react-native";

import { status as statusTokens } from "@presentation/theme";

export const successStyles = StyleSheet.create({
  check: {
    width: 84,
    height: 84,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    backgroundColor: statusTokens.ok,
  },
  checkMark: { fontSize: 40, color: "#fff" },
  subMaxWidth: { maxWidth: 300 },
});

/** Scroll padding depends on safe-area insets, so it is a runtime factory. */
export const successScrollContent = (top: number, bottom: number) => ({
  padding: 20,
  paddingTop: top + 40,
  paddingBottom: bottom + 40,
});
