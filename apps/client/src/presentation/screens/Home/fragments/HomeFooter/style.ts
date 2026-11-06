import { StyleSheet } from "react-native";
import {
  designColors,
  designSpacingSemantic,
  plusJakartaSansFonts,
} from "@presentation/theme";

export const componentStyles = StyleSheet.create({
  elementBackgroundColor3: {
    backgroundColor: designColors.ink,
    paddingTop: designSpacingSemantic.xl,
    paddingHorizontal: designSpacingSemantic.m,
  },
  elementFlexDirection4: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designSpacingSemantic.l,
    marginBottom: designSpacingSemantic.xl,
  },
  elementFlex5: { flex: 1, minWidth: 280 },
  elementColor6: {
    color: designColors.ground,
    fontSize: 20,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: -0.4,
    fontFamily: plusJakartaSansFonts.bold,
    marginBottom: designSpacingSemantic.m,
  },
  elementColor7: {
    color: designColors.ground,
    fontSize: 14,
    lineHeight: 22.4,
    opacity: 0.7,
    fontFamily: plusJakartaSansFonts.bold,
    maxWidth: 300,
  },
  elementMinWidth8: { minWidth: 140 },
  elementColor9: {
    color: designColors.ground,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.96, // 0.08em
    fontFamily: plusJakartaSansFonts.bold,
    marginBottom: designSpacingSemantic.m,
  },
  elementFlexDirection10: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: designSpacingSemantic.m,
    paddingTop: designSpacingSemantic.l,
    paddingBottom: designSpacingSemantic.l,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  elementColor11: {
    color: designColors.ground,
    fontSize: 14,
    opacity: 0.6,
    fontFamily: plusJakartaSansFonts.bold,
  },
  elementFlexDirection12: { flexDirection: "row", gap: 8 },
});
