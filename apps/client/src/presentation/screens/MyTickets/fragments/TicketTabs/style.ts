import { StyleSheet } from "react-native";

import {
  designBorders,
  designColors,
  plusJakartaSansFonts,
} from "@presentation/theme";

export const ticketTabsStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 24,
    borderBottomWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: { backgroundColor: designColors.ink },
  inactiveTab: { backgroundColor: designColors.ground },
  label: {
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  activeLabel: { color: designColors.ground },
});
