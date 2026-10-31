/** EventDetail styles — extracted from inline `style={{…}}` (refactor rule). */
import { StyleSheet, type DimensionValue } from "react-native";

import { brand, neutral, status as statusTokens } from "@presentation/theme";

export const detailStyles = StyleSheet.create({
  // Block (dark glass panel)
  block: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: neutral.lineDark,
    borderRadius: 22,
    padding: 20,
    marginTop: 14,
  },
  blockHeadRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  blockLabel: { fontSize: 10, letterSpacing: 2 },
  blockHeading: { fontSize: 19, letterSpacing: -0.3, marginTop: 8 },
  blockBody: { marginTop: 10 },
  gapBadge: {
    marginLeft: 8,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 999,
    backgroundColor: "rgba(232,131,12,0.16)",
    borderWidth: 1,
    borderColor: "rgba(232,131,12,0.3)",
  },
  gapBadgeText: { fontSize: 8, letterSpacing: 1, color: "#ffcf99" },

  // Fact (buy-box stat)
  fact: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: neutral.lineDark,
    borderRadius: 13,
    padding: 12,
  },
  factLabel: { fontSize: 9, letterSpacing: 1 },
  factValue: { fontSize: 12, marginTop: 6 },

  // TrustBox
  trustBox: {
    marginTop: 14,
    gap: 9,
    padding: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: neutral.lineDark,
    borderRadius: 18,
  },
  trustRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  trustCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(23,163,74,0.2)",
  },
  trustCheck: { fontSize: 11, color: statusTokens.okDark },
  trustText: { fontSize: 12 },

  // Body text
  aboutText: { fontSize: 14, lineHeight: 24 },
  lineupList: { gap: 10 },
  lineupRow: {
    paddingVertical: 13,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
  },
  lineupText: { fontSize: 13 },
  termsText: { fontSize: 13, lineHeight: 22 },

  // Hero
  hero: { minHeight: 250, borderRadius: 26, overflow: "hidden", justifyContent: "flex-end" },
  heroScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,10,12,0.55)",
  },
  heroPad: { padding: 20 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  statusDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: "#ff3b4e" },
  statusText: { fontSize: 11 },
  heroName: { fontSize: 30, lineHeight: 32, letterSpacing: -0.9, marginTop: 14, marginBottom: 8 },
  heroMeta: { fontSize: 13 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 15 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
  },
  chipText: { fontSize: 11 },

  // Buy box
  buyBox: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: neutral.lineDark,
    borderRadius: 22,
    padding: 22,
  },
  buyPriceRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 },
  buyPriceLabel: { fontSize: 11 },
  buyPrice: { fontSize: 28, letterSpacing: -0.5 },
  factsWrap: { marginTop: 18, gap: 8 },
  factsRow: { flexDirection: "row", gap: 8 },
  ctaText: { fontSize: 15 },
  ctaPin: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: brand.red,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaPinText: { fontSize: 14, color: "#fff" },
  joinError: { fontSize: 11, marginTop: 10, textAlign: "center" },
  buyFine: { fontSize: 11, lineHeight: 17, marginTop: 13 },

  // Steps/eyebrow shared
  stepsLabel: { fontSize: 10, letterSpacing: 2 },
});

/** CTA button — base + opacity depends on the disabled state (runtime). */
export const detailCta = (disabled: boolean) => ({
  marginTop: 20,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  gap: 12,
  borderRadius: 999,
  paddingVertical: 16,
  backgroundColor: "#fff",
  opacity: disabled ? 0.45 : 1,
});

/** Scroll content: fixed pads + optional desktop max-width (920px wrap). */
export const detailScrollContent = (isDesktop: boolean) => ({
  paddingHorizontal: 20,
  paddingTop: 22,
  paddingBottom: 48,
  ...(isDesktop ? { maxWidth: 960, width: "100%" as DimensionValue, alignSelf: "center" as const } : {}),
});
