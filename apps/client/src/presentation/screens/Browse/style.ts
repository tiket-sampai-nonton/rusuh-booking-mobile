/**
 * RBT-089 —  Brutalist Mono Browse Screen Styles
 *
 * PROTOTYPE 05-browse.html EXACT COPY:
 * - White background (var(--white)), black ink (var(--black))
 * - 2px solid borders everywhere
 * - Plus Jakarta Sans font family (800 extra-bold, 700 bold)
 * - Hero: black bg with noise texture
 * - Categories: button grid with fill-up hover
 * - Cards: grayscale→color on hover, 8px shadow offset
 * - No rounded corners anywhere
 */
import {
  type DimensionValue,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import {
  brand,
  designColors,
  designBorders,
  designSpacingSemantic,
} from "@presentation/theme";
import { plusJakartaSansFonts } from "@presentation/theme/fonts";
import { hardShadowStyle } from "@presentation/utils/style";

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

/** Scroll content: max-width container on desktop (prototype max-width: 1400px) */
export const browseScrollContent = (
  bottom: number,
  isDesktop: boolean,
  isMobileWeb = false,
): ViewStyle => ({
  paddingBottom: bottom + (isMobileWeb ? 24 : 88),
  ...(isDesktop
    ? {
        maxWidth: 1400,
        width: "100%" as DimensionValue,
        alignSelf: "center" as const,
      }
    : {}),
});

export const browseRoot: ViewStyle = {
  flex: 1,
  backgroundColor: designColors.ground,
};
export const browseScroll: ViewStyle = { flex: 1 };
export const browseNativeScrollContent = (top: number): ViewStyle => ({
  paddingTop: top,
});
export const browseNativeMain: ViewStyle = { paddingHorizontal: 16 };
export const browseHeroText = (isDesktop: boolean): TextStyle => {
  const size = isDesktop ? 80 : 40;
  return {
    color: designColors.ground,
    fontSize: size,
    fontFamily: plusJakartaSansFonts.extraBold,
    letterSpacing: -0.04 * size,
    lineHeight: isDesktop ? 72 : 36,
    textAlign: "center",
  };
};

export const browseHeroTextStyle = (
  isDesktop: boolean,
  isMobileWeb: boolean,
): TextStyle => {
  if (!isMobileWeb) return browseHeroText(isDesktop);
  return {
    color: designColors.ink,
    fontSize: 28,
    fontFamily: plusJakartaSansFonts.extraBold,
    letterSpacing: -1.1,
    lineHeight: 30,
    textAlign: "left",
    textTransform: "none",
  };
};

export const browseHeroEyebrow: TextStyle = {
  color: designColors.inkMuted,
  fontFamily: plusJakartaSansFonts.bold,
  fontSize: 10,
  letterSpacing: 1,
  textTransform: "uppercase",
};

export const browseHeroCompactStyle: ViewStyle = {
  backgroundColor: designColors.ground,
  paddingHorizontal: 16,
  paddingBottom: 16,
  alignItems: "flex-start",
};
export const browseCategoryHeading: TextStyle = {
  color: designColors.ink,
  fontSize: 24,
  fontFamily: plusJakartaSansFonts.extraBold,
  textTransform: "uppercase",
  letterSpacing: -0.48,
};
export const browseCategoryHeadingWrap: ViewStyle = { marginBottom: 32 };
export const browseCategoryGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 16,
};
export const browseCategoryControls: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 16,
};
export const browseCategoryControlsCompact: ViewStyle = {
  flexDirection: "column",
  flexWrap: "nowrap",
  alignItems: "stretch",
  gap: 12,
};
export const browseCategoryLabel = (isActive: boolean): TextStyle => ({
  color: isActive ? designColors.ground : designColors.ink,
  fontFamily: plusJakartaSansFonts.bold,
  fontSize: 14,
  textTransform: "uppercase",
});
export const browseNativeHeader: ViewStyle = {
  marginBottom: 8,
  paddingVertical: 8,
  paddingHorizontal: 0,
  borderBottomWidth: 1,
  borderBottomColor: designColors.ink,
  borderStyle: "dashed",
};
export const browseCountText: TextStyle = {
  color: designColors.inkMuted,
  fontFamily: plusJakartaSansFonts.regular,
  fontSize: 14,
};
export const browseCountValue: TextStyle = {
  color: designColors.ink,
  fontFamily: plusJakartaSansFonts.bold,
};
export const browseToolbarActions: ViewStyle = {
  flexDirection: "row",
  gap: 16,
  alignItems: "center",
};
export const browseToolbarActionsCompactStyle: ViewStyle = { gap: 8 };
export const browseFilterButton: ViewStyle = {
  width: 36,
  height: 36,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2,
  borderColor: designColors.ink,
};
export const browseFilterButtonCompactStyle: ViewStyle = {
  width: 40,
  height: 40,
  borderWidth: 1,
};
export const browseNativeViewButton: ViewStyle = {
  width: 36,
  height: 36,
  paddingVertical: 0,
  paddingHorizontal: 0,
  alignItems: "center",
  justifyContent: "center",
};
export const browseViewDivider: ViewStyle = {
  width: designBorders.standard,
  backgroundColor: designColors.ink,
};
export const browseSortControl = {
  borderWidth: 0,
  backgroundColor: designColors.transparent,
  fontFamily: plusJakartaSansFonts.medium,
  fontWeight: "500",
  fontSize: 14,
  cursor: "pointer",
  outlineWidth: 0,
};
export const BROWSE_NATIVE_CATEGORY_BAR_HEIGHT = 52;

export const browseNativeCategoryBar: ViewStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  zIndex: 98,
  height: BROWSE_NATIVE_CATEGORY_BAR_HEIGHT,
  backgroundColor: designColors.ground,
  borderBottomWidth: 2,
  borderBottomColor: designColors.ink,
};
export const browseNativeCategoryBarPosition = (top: number): ViewStyle => ({
  top,
});
export const browseNativeCategoryScrollContent: ViewStyle = {
  paddingHorizontal: 16,
  alignItems: "center",
  gap: 8,
};
export const browseNativeCategorySummary: ViewStyle = {
  alignSelf: "center",
};
export const browseNativeCategoryScroll: ViewStyle = {
  height: BROWSE_NATIVE_CATEGORY_BAR_HEIGHT,
};
export const browseNativeCategoryButton = (active: boolean): ViewStyle => ({
  paddingHorizontal: 16,
  minHeight: 34,
  justifyContent: "center",
  borderWidth: 2,
  borderColor: designColors.ink,
  backgroundColor: active ? brand.deep : designColors.ground,
  ...(active ? hardShadowStyle(3, 3, designColors.ink) : {}),
});
export const browseNativeCategoryLabel = (active: boolean): TextStyle => ({
  color: active ? designColors.ground : designColors.ink,
  fontFamily: plusJakartaSansFonts.semiBold,
  fontSize: 12,
  textTransform: "uppercase",
});

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION (prototype .hero — black bg with noise)
// ═══════════════════════════════════════════════════════════════════════════════

export const browseHero: ViewStyle = {
  backgroundColor: designColors.ink,
  paddingTop: 96, // prototype: padding: 8rem 2rem 4rem
  paddingHorizontal: designSpacingSemantic.m,
  paddingBottom: 48,
  alignItems: "center",
};

export const browseHeroTitle: ViewStyle = {
  marginBottom: 24,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES SECTION (prototype .categories)
// ═══════════════════════════════════════════════════════════════════════════════

export const browseCategories: ViewStyle = {
  paddingVertical: 48,
  paddingHorizontal: designSpacingSemantic.m,
  backgroundColor: designColors.ground,
  borderBottomWidth: designBorders.standard,
  borderBottomColor: designColors.ink,
};

export const browseCategoriesCompactStyle: ViewStyle = {
  paddingTop: 0,
  paddingBottom: 16,
  paddingHorizontal: 16,
  borderBottomWidth: 0,
};

export const browseCategoryGridCompactStyle: ViewStyle = {
  flexDirection: "row",
  flexWrap: "nowrap",
  gap: 8,
};

export const browseCategoryBtnCompactStyle: ViewStyle = {
  minHeight: 34,
  paddingVertical: 5,
  paddingHorizontal: 12,
};

export const browseCategoriesInner = (isDesktop: boolean): ViewStyle => ({
  maxWidth: isDesktop ? 1400 : undefined,
  width: "100%" as DimensionValue,
  alignSelf: "center" as const,
});

export const browseCategoryBtn: ViewStyle = {
  minHeight: 34,
  paddingVertical: 5,
  paddingHorizontal: 12,
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
  backgroundColor: designColors.ground,
};

export const browseCategoryBtnActive: ViewStyle = {
  ...browseCategoryBtn,
  backgroundColor: brand.deep,
  borderColor: designColors.ink,
  ...hardShadowStyle(3, 3, designColors.ink),
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CONTENT (prototype main)
// ═══════════════════════════════════════════════════════════════════════════════

export const browseMain = (
  isDesktop: boolean,
  isMobileWeb = false,
): ViewStyle => ({
  paddingTop: isMobileWeb ? 0 : 48,
  paddingBottom: isMobileWeb ? 24 : 48,
  paddingHorizontal: isMobileWeb ? 16 : designSpacingSemantic.m,
  maxWidth: isDesktop ? 1400 : undefined,
  width: "100%" as DimensionValue,
  alignSelf: "center" as const,
});

export const browseHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 32,
  flexWrap: "wrap",
  gap: 16,
};

export const browseHeaderCompactStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "nowrap",
  gap: 8,
  marginBottom: 12,
};

export const browseViewToggle: ViewStyle = {
  flexDirection: "row",
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
};

export const browseViewBtn: ViewStyle = {
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: designColors.ground,
};

export const browseViewBtnActive: ViewStyle = {
  ...browseViewBtn,
  backgroundColor: designColors.accentDeep,
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
  ...hardShadowStyle(3, 3, designColors.ink),
};

export const browseSortSelect: ViewStyle = {
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
  backgroundColor: designColors.ground,
};

export const browseSortSelectCompactStyle: ViewStyle = {
  paddingVertical: 8,
  paddingHorizontal: 8,
  borderWidth: 1,
  maxWidth: 146,
};

export const browseSortControlCompactStyle = {
  fontSize: 12,
  maxWidth: 128,
  padding: 0,
};

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS GRID (prototype .events-grid)
// ═══════════════════════════════════════════════════════════════════════════════

const GAP_DESKTOP = 32; // desktop prototype gap: 2rem
const GAP_MOBILE = 16; // mobile prototype gap: --space-s (16px)

/** Multi-column grid row */
export const browseGridRow = (isNative = false): ViewStyle => {
  const gap = isNative ? GAP_MOBILE : GAP_DESKTOP;
  return {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -gap / 2,
  };
};

/** Inset native grid rows so their cards do not touch the device edge. */
export const browseNativeGridRowInset: ViewStyle = { marginHorizontal: 8 };

/** Inset native single-column cards without changing the toolbar spacing. */
export const browseNativeListItem: ViewStyle = {
  alignSelf: "stretch",
  marginHorizontal: 16,
};

/** Single-column grid (list view) */
export const browseGridList = (
  isNative = false,
  isMobileWeb = false,
): ViewStyle => {
  let gap = 16;
  if (isNative) gap = GAP_MOBILE;
  if (isMobileWeb) gap = 8;
  return { gap };
};

/** One cell in the multi-column grid */
export const browseGridCell = (
  columns: number,
  isNative = false,
): ViewStyle => {
  const gap = isNative ? GAP_MOBILE : GAP_DESKTOP;
  return {
    width: `${100 / columns}%` as DimensionValue,
    paddingHorizontal: gap / 2,
    marginBottom: gap,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY / LOADING STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const browseEmpty: ViewStyle = {
  marginTop: 32,
  padding: 48,
  borderWidth: designBorders.standard,
  borderStyle: "dashed",
  borderColor: designColors.ink,
  alignItems: "center",
};

export const browseLoading: ViewStyle = {
  marginTop: 48,
  alignItems: "center",
};
