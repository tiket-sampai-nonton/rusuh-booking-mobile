import { StyleSheet } from "react-native";

import { designColors } from "@presentation/theme";

export const browseChipsStyles = StyleSheet.create({
  container: {
    gap: 8,
  },
  refineButton: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButton: {
    borderWidth: 2,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  resetText: {
    color: designColors.ink,
  },
});
