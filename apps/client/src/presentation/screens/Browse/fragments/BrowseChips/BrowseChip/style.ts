import { StyleSheet } from "react-native";

import { designColors } from "@presentation/theme";

export const browseChipStyles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  selectedContainer: {
    borderColor: designColors.ember,
  },
  label: {
    color: designColors.muted,
    letterSpacing: 0.5,
  },
  value: {
    color: designColors.ink,
  },
});
