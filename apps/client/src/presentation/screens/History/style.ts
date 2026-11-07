/**
 * History screen styles —  Brutalist Mono (prototype 04-my-tickets).
 *
 * Styling:
 * - Hero: black bg, white title, noise texture
 * - Grid: 2px solid ink borders, grayscale images
 * - States: dashed empty, solid error
 */
import { StyleSheet, type DimensionValue, type ViewStyle } from "react-native";

import {
  designColors,
  designBorders,
  designSpacingSemantic,
  plusJakartaSansFonts,
} from "@presentation/theme";

/** Grid gap between cards */
const GRID_GAP = 2;

/**  Brutalist history styles */
export const historyStyles = StyleSheet.create({
  /** Screen container with ground background */
  container: {
    flex: 1,
    backgroundColor: designColors.ground,
  },
  /** Hero section — black bg with noise texture */
  hero: {
    backgroundColor: designColors.ink,
    paddingTop: 120, // header height + extra space
    paddingBottom: 64,
    paddingHorizontal: designSpacingSemantic.m,
  },
  mobileWebHero: {
    backgroundColor: designColors.ground,
    paddingTop: 72,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  heroContent: {
    maxWidth: 800,
    alignSelf: "center" as const,
    width: "100%" as DimensionValue,
  },
  heroTitle: {
    color: designColors.ground,
    fontSize: 48,
    fontFamily: plusJakartaSansFonts.extraBold,
    textTransform: "uppercase",
    letterSpacing: -1.92, // -0.04em * 48
    lineHeight: 48 * 0.9,
    textAlign: "center" as const,
  },
  mobileWebHeroTitle: {
    color: designColors.ink,
    fontSize: 30,
    lineHeight: 32,
    textAlign: "left",
    letterSpacing: -1.2,
    textTransform: "none",
  },
  heroSubtitle: {
    color: designColors.ground,
    opacity: 0.7,
    fontSize: 18,
    fontFamily: plusJakartaSansFonts.regular,
    textAlign: "center" as const,
    marginTop: 16,
  },
  mobileWebHeroSubtitle: {
    color: designColors.gray,
    opacity: 1,
    fontSize: 14,
    textAlign: "left",
    marginTop: 6,
  },
  /** Main content container */
  main: {
    maxWidth: 1200,
    width: "100%" as DimensionValue,
    alignSelf: "center" as const,
    paddingHorizontal: designSpacingSemantic.m,
    paddingTop: designSpacingSemantic.xl,
  },
  mobileWebMain: { paddingHorizontal: 16, paddingTop: 0 },
  /** Section title */
  sectionTitle: {
    color: designColors.ink,
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 0.56, // 0.04em
    marginBottom: designSpacingSemantic.m,
  },
  /** Grid container — ink background creates 2px borders via gap */
  gridContainer: {
    backgroundColor: designColors.ink,
    gap: GRID_GAP,
    marginTop: designSpacingSemantic.m,
  },
  /** Single column list for mobile */
  gridList: {
    gap: GRID_GAP,
    backgroundColor: designColors.ink,
  },
});

/**  brutalist state cards — dashed empty box, hard-bordered error box. */
export const historyStateStyles = StyleSheet.create({
  /** State content replaces the default section top spacing. */
  main: {
    paddingTop: 0,
  },
  /** Loading state — centered spinner */
  loadingContainer: {
    paddingVertical: 80,
    alignItems: "center",
  },
  /** Empty state — dashed border box */
  emptyCard: {
    borderWidth: designBorders.standard,
    borderStyle: "dashed",
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    paddingVertical: 80,
    paddingHorizontal: designSpacingSemantic.m,
    alignItems: "center",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: designSpacingSemantic.m,
  },
  emptyTitle: {
    color: designColors.ink,
    fontSize: 24,
    fontFamily: plusJakartaSansFonts.extraBold,
    textTransform: "uppercase",
    letterSpacing: -0.48, // -0.02em
    textAlign: "center" as const,
  },
  emptyText: {
    color: designColors.inkMuted,
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.regular,
    textAlign: "center" as const,
    marginTop: 12,
    marginBottom: designSpacingSemantic.m,
  },
  /** Error state — solid border with accent color */
  errorCard: {
    borderWidth: designBorders.standard,
    borderColor: designColors.danger,
    backgroundColor: designColors.ground,
    paddingVertical: 48,
    paddingHorizontal: designSpacingSemantic.m,
    alignItems: "center",
  },
  errorTitle: {
    color: designColors.danger,
    fontSize: 16,
    fontFamily: plusJakartaSansFonts.extraBold,
    textTransform: "uppercase",
  },
  errorText: {
    color: designColors.inkMuted,
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.regular,
    marginTop: 8,
    textAlign: "center" as const,
  },
  /** Browse button CTA */
  browseBtn: {
    backgroundColor: designColors.ink,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  browseBtnText: {
    color: designColors.ground,
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.bold,
    textTransform: "uppercase",
  },
});

/** Scroll content factory with bottom inset + desktop container. */
export const historyScrollContent = (
  bottom: number,
  isDesktop: boolean,
): ViewStyle => ({
  paddingBottom: bottom + 64,
  ...(isDesktop
    ? {
        maxWidth: 1200,
        width: "100%" as DimensionValue,
        alignSelf: "center" as const,
      }
    : {}),
});

/** Multi-column grid row (desktop) — using ink background for borders. */
export const historyGridRow: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  backgroundColor: designColors.ink,
  gap: GRID_GAP,
};

/** One cell in the multi-column grid. */
export const historyGridCell = (columns: number): ViewStyle => ({
  width:
    `${(100 - (GRID_GAP * (columns - 1)) / columns) / columns}%` as DimensionValue,
  flexGrow: 1,
  flexBasis: `${100 / columns - 1}%` as DimensionValue,
});
