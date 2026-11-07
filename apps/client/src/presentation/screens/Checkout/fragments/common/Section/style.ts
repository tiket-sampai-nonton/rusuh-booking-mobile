import { StyleSheet } from "react-native";

import { designColors, plusJakartaSansFonts } from "@presentation/theme";

export const checkoutSectionStyles = StyleSheet.create({
  container: { marginTop: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: designColors.ink,
  },
  numberBadge: {
    width: 32,
    height: 32,
    backgroundColor: designColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    color: designColors.ground,
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.bold,
  },
  title: {
    color: designColors.ink,
    fontSize: 20,
    fontFamily: plusJakartaSansFonts.extraBold,
    textTransform: "uppercase",
    letterSpacing: -0.4,
  },
});

export const compactSectionStyles = StyleSheet.create({
  container: { marginTop: 20 },
  header: {
    gap: 10,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  numberBadge: { width: 26, height: 26 },
  title: { fontSize: 16, letterSpacing: -0.2 },
});
