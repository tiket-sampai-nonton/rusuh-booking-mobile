import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { plusJakartaSansFonts, designColors } from "@presentation/theme";

export function profileContentContainerStyle(
  topInset: number,
  bottomInset: number,
  isMobileWeb = false,
): ViewStyle {
  return {
    paddingTop: topInset + (isMobileWeb ? 72 : 96),
    paddingHorizontal: 16,
    paddingBottom: bottomInset + (isMobileWeb ? 24 : 120),
    alignItems: "center",
  };
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: designColors.ground },
  content: { width: "100%", maxWidth: 960, alignSelf: "center" },
  hero: {
    minHeight: 216,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 2,
    borderColor: designColors.ink,
    backgroundColor: designColors.ink,
  },
  mobileWebHero: { minHeight: 196, paddingHorizontal: 20 },
  heroWatermark: {
    position: "absolute",
    width: 230,
    height: 230,
    right: -28,
    top: -14,
    opacity: 0.1,
  },
  heroContent: { alignItems: "flex-start" },
  heroEyebrow: {
    color: designColors.warning,
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 11,
    letterSpacing: 2,
  },
  heroHeading: {
    marginTop: 8,
    color: designColors.ground,
    fontFamily: plusJakartaSansFonts.extraBold,
    fontSize: 36,
    lineHeight: 42,
  },
  mobileWebHeading: { fontSize: 32, lineHeight: 38 },
  heroDescription: {
    maxWidth: 280,
    marginTop: 8,
    color: designColors.ground,
    opacity: 0.78,
    fontFamily: plusJakartaSansFonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  heroStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  heroStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: designColors.warning,
  },
  heroStatusText: {
    color: designColors.ground,
    fontFamily: plusJakartaSansFonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
