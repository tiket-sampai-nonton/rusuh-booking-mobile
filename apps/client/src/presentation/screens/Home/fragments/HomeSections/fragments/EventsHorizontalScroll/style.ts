import { StyleSheet } from "react-native";
import {
  designBorders,
  designColors,
  designSpacingSemantic,
  plusJakartaSansFonts,
} from "@presentation/theme";

export const styles = StyleSheet.create({
  content: { paddingRight: designSpacingSemantic.m, gap: 16 },
  card: { width: 280 },
  empty: {
    padding: 48,
    borderWidth: designBorders.standard,
    borderStyle: "dashed",
    borderColor: designColors.ink,
  },
  emptyLabel: {
    color: designColors.inkMuted,
    fontSize: 14,
    textAlign: "center",
    fontFamily: plusJakartaSansFonts.regular,
  },
  list: {
    marginHorizontal: -designSpacingSemantic.m,
    paddingLeft: designSpacingSemantic.m,
  },
});
