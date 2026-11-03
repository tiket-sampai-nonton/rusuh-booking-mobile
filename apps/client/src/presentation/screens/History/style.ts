/**
 * History screen styles — V2 Brutalist Mono (prototype 04-my-tickets).
 *
 * Styling:
 * - Hero: black bg, white title, noise texture
 * - Grid: 2px solid ink borders, grayscale images
 * - States: dashed empty, solid error
 */
import { StyleSheet, type DimensionValue, type ViewStyle } from "react-native";

import { v2Colors, v2Borders, v2SpacingSemantic, interFonts } from "@presentation/theme";

/** Grid gap between cards */
const GRID_GAP = 2;

/** V2 Brutalist history styles */
export const historyStyles = StyleSheet.create({
  /** Screen container with ground background */
  container: {
    flex: 1,
    backgroundColor: v2Colors.ground,
  },
  /** Hero section — black bg with noise texture */
  hero: {
    backgroundColor: v2Colors.ink,
    paddingTop: 120, // header height + extra space
    paddingBottom: 64,
    paddingHorizontal: v2SpacingSemantic.m,
  },
  heroContent: {
    maxWidth: 800,
    alignSelf: "center" as const,
    width: "100%" as DimensionValue,
  },
  heroTitle: {
    color: v2Colors.ground,
    fontSize: 48,
    fontFamily: interFonts.black,
    textTransform: "uppercase",
    letterSpacing: -1.92, // -0.04em * 48
    lineHeight: 48 * 0.9,
    textAlign: "center" as const,
  },
  heroSubtitle: {
    color: v2Colors.ground,
    opacity: 0.7,
    fontSize: 18,
    fontFamily: interFonts.regular,
    textAlign: "center" as const,
    marginTop: 16,
  },
  /** Main content container */
  main: {
    maxWidth: 1200,
    width: "100%" as DimensionValue,
    alignSelf: "center" as const,
    paddingHorizontal: v2SpacingSemantic.m,
    paddingTop: v2SpacingSemantic.xl,
  },
  /** Section title */
  sectionTitle: {
    color: v2Colors.ink,
    fontSize: 14,
    fontFamily: interFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 0.56, // 0.04em
    marginBottom: v2SpacingSemantic.m,
  },
  /** Grid container — ink background creates 2px borders via gap */
  gridContainer: {
    backgroundColor: v2Colors.ink,
    gap: GRID_GAP,
    marginTop: v2SpacingSemantic.m,
  },
  /** Single column list for mobile */
  gridList: {
    gap: GRID_GAP,
    backgroundColor: v2Colors.ink,
  },
});

/** V2 brutalist state cards — dashed empty box, hard-bordered error box. */
export const historyStateStyles = StyleSheet.create({
  /** Loading state — centered spinner */
  loadingContainer: {
    paddingVertical: 80,
    alignItems: "center",
  },
  /** Empty state — dashed border box */
  emptyCard: {
    borderWidth: v2Borders.standard,
    borderStyle: "dashed",
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
    paddingVertical: 80,
    paddingHorizontal: v2SpacingSemantic.m,
    alignItems: "center",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: v2SpacingSemantic.m,
  },
  emptyTitle: {
    color: v2Colors.ink,
    fontSize: 24,
    fontFamily: interFonts.black,
    textTransform: "uppercase",
    letterSpacing: -0.48, // -0.02em
    textAlign: "center" as const,
  },
  emptyText: {
    color: v2Colors.inkMuted,
    fontSize: 14,
    fontFamily: interFonts.regular,
    textAlign: "center" as const,
    marginTop: 12,
    marginBottom: v2SpacingSemantic.m,
  },
  /** Error state — solid border with accent color */
  errorCard: {
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.danger,
    backgroundColor: v2Colors.ground,
    paddingVertical: 48,
    paddingHorizontal: v2SpacingSemantic.m,
    alignItems: "center",
  },
  errorTitle: {
    color: v2Colors.danger,
    fontSize: 16,
    fontFamily: interFonts.black,
    textTransform: "uppercase",
  },
  errorText: {
    color: v2Colors.inkMuted,
    fontSize: 14,
    fontFamily: interFonts.regular,
    marginTop: 8,
    textAlign: "center" as const,
  },
  /** Browse button CTA */
  browseBtn: {
    backgroundColor: v2Colors.ink,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  browseBtnText: {
    color: v2Colors.ground,
    fontSize: 14,
    fontFamily: interFonts.bold,
    textTransform: "uppercase",
  },
});

/** Scroll content factory with bottom inset + desktop container. */
export const historyScrollContent = (bottom: number, isDesktop: boolean): ViewStyle => ({
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
  backgroundColor: v2Colors.ink,
  gap: GRID_GAP,
};

/** One cell in the multi-column grid. */
export const historyGridCell = (columns: number): ViewStyle => ({
  width: `${(100 - (GRID_GAP * (columns - 1)) / columns) / columns}%` as DimensionValue,
  flexGrow: 1,
  flexBasis: `${100 / columns - 1}%` as DimensionValue,
});
