import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

import {
  designBorders,
  designColors,
  plusJakartaSansFonts,
} from "@presentation/theme";

export const pillGroupStyles = StyleSheet.create({
  group: {
    marginBottom: 16,
  },
  choices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  selectedOption: {
    backgroundColor: designColors.ink,
  },
  unselectedOption: {
    backgroundColor: designColors.ground,
  },
  optionText: {
    fontFamily: plusJakartaSansFonts.semiBold,
    fontSize: 12,
  },
  selectedText: {
    color: designColors.ground,
  },
  unselectedText: {
    color: designColors.ink,
  },
  label: {
    color: designColors.inkMuted,
  },
});

export function pillOptionStyle(selected: boolean): ViewStyle {
  return selected
    ? pillGroupStyles.selectedOption
    : pillGroupStyles.unselectedOption;
}

export function pillTextStyle(selected: boolean): TextStyle {
  return selected
    ? pillGroupStyles.selectedText
    : pillGroupStyles.unselectedText;
}
