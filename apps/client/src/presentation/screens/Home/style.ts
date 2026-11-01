/** Home screen styles — extracted from inline `style={{…}}` (refactor rule). */
import { StyleSheet, type DimensionValue } from "react-native";

const GAP = 22;
const DESKTOP_MAX = 1180; // prototype index.html .wrap max-width

export const homeStyles = StyleSheet.create({
  heroLoading: { height: 760 },
  sectionFeatured: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 20 },
  sectionHistory: { paddingHorizontal: 20, paddingBottom: 48 },
  filterBtn: { paddingVertical: 13, paddingHorizontal: 22 },
  navLink: { paddingHorizontal: 14, paddingVertical: 8 },
  navLinkText: { fontSize: 13 },
  ctaInner: { paddingLeft: 18, paddingRight: 9, paddingVertical: 9 },
  ctaText: { fontSize: 13 },
  ctaPin: { width: 26, height: 26 },
  emptyGrid: {
    padding: 30,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(10,10,12,0.08)",
    borderRadius: 20,
  },
  gridList: { gap: GAP },
  gridRow: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -GAP / 2 },
});

/** Scroll content bottom inset (runtime). */
export const homeScrollContent = (bottom: number) => ({ paddingBottom: bottom });

/** Desktop centered container (web-wide only). */
export const homeContainer = (isDesktop: boolean) =>
  isDesktop
    ? { maxWidth: DESKTOP_MAX, width: "100%" as DimensionValue, alignSelf: "center" as const }
    : undefined;

/** Floating nav wrapper (absolute, clears the top safe-area inset). */
export const homeNavWrap = (top: number) => ({
  position: "absolute" as const,
  top: top + 8,
  left: 0,
  right: 0,
  alignItems: "center" as const,
});

/** Floating nav pill (max-width keeps it off the screen edges). */
export const homeNavPill = (width: number) => ({
  paddingLeft: 20,
  paddingRight: 10,
  paddingVertical: 10,
  maxWidth: width - 28,
});

/** One cell in the desktop multi-column card grid. */
export const homeGridCell = (columns: number) => ({
  width: `${100 / columns}%` as DimensionValue,
  paddingHorizontal: GAP / 2,
  marginBottom: GAP,
});
