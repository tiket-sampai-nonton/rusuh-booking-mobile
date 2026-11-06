/**
 * RBT-089 —  Brutalist Mono Browse Screen Styles
 *
 * PROTOTYPE 05-browse.html EXACT COPY:
 * - White background (var(--white)), black ink (var(--black))
 * - 2px solid borders everywhere
 * - Inter font family (900 black, 700 bold)
 * - Hero: black bg with noise texture
 * - Categories: button grid with fill-up hover
 * - Cards: grayscale→color on hover, 8px shadow offset
 * - No rounded corners anywhere
 */
import { type DimensionValue, type TextStyle, type ViewStyle } from 'react-native';

import { designColors, designBorders, designSpacingSemantic } from '@presentation/theme';
import { interFonts } from '@presentation/theme/fonts';

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

/** Scroll content: max-width container on desktop (prototype max-width: 1400px) */
export const browseScrollContent = (bottom: number, isDesktop: boolean): ViewStyle => ({
  paddingBottom: bottom + 88,
  ...(isDesktop
    ? {
        maxWidth: 1400,
        width: '100%' as DimensionValue,
        alignSelf: 'center' as const,
      }
    : {}),
});

export const browseRoot: ViewStyle = { flex: 1, backgroundColor: designColors.ground };
export const browseScroll: ViewStyle = { flex: 1 };
export const browseNativeScrollContent = (top: number): ViewStyle => ({ paddingTop: top });
export const browseNativeMain: ViewStyle = { paddingHorizontal: 16 };
export const browseHeroText = (isDesktop: boolean): TextStyle => {
  const size = isDesktop ? 80 : 40;
  return {
    color: designColors.ground,
    fontSize: size,
    fontFamily: interFonts.black,
    letterSpacing: -0.04 * size,
    lineHeight: isDesktop ? 72 : 36,
    textAlign: 'center',
  };
};
export const browseCategoryHeading: TextStyle = {
  color: designColors.ink,
  fontSize: 24,
  fontFamily: interFonts.black,
  textTransform: 'uppercase',
  letterSpacing: -0.48,
};
export const browseCategoryHeadingWrap: ViewStyle = { marginBottom: 32 };
export const browseCategoryGrid: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 16 };
export const browseCategoryLabel = (isActive: boolean): TextStyle => ({
  color: isActive ? designColors.ground : designColors.ink,
  fontFamily: interFonts.bold,
  fontSize: 14,
  textTransform: 'uppercase',
});
export const browseNativeHeader: ViewStyle = {
  marginBottom: 8,
  paddingVertical: 8,
  paddingHorizontal: 0,
  borderBottomWidth: 1,
  borderBottomColor: designColors.ink,
  borderStyle: 'dashed',
};
export const browseCountText: TextStyle = {
  color: designColors.inkMuted,
  fontFamily: interFonts.regular,
  fontSize: 14,
};
export const browseCountValue: TextStyle = { color: designColors.ink, fontFamily: interFonts.bold };
export const browseToolbarActions: ViewStyle = { flexDirection: 'row', gap: 16, alignItems: 'center' };
export const browseFilterButton: ViewStyle = {
  width: 36,
  height: 36,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: designColors.ink,
};
export const browseNativeViewButton: ViewStyle = {
  width: 36,
  height: 36,
  paddingVertical: 0,
  paddingHorizontal: 0,
  alignItems: 'center',
  justifyContent: 'center',
};
export const browseViewDivider: ViewStyle = { width: designBorders.standard, backgroundColor: designColors.ink };
export const browseSortControl = {
  borderWidth: 0,
  backgroundColor: 'transparent',
  fontFamily: interFonts.medium,
  fontWeight: '500',
  fontSize: 14,
  cursor: 'pointer',
  outlineWidth: 0,
};
export const browseLoadMorePressed: ViewStyle = { backgroundColor: designColors.ink };
export const browseLoadMoreDisabled: ViewStyle = { opacity: 0.5 };
export const browseLoadMoreLabel = (disabled: boolean): TextStyle => ({
  color: disabled ? designColors.inkMuted : designColors.ink,
  fontFamily: interFonts.bold,
  fontSize: 14,
  textTransform: 'uppercase',
});
export const browseNativeCategoryBar: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  zIndex: 98,
  height: 52,
  backgroundColor: designColors.ground,
  borderBottomWidth: 2,
  borderBottomColor: designColors.ink,
};
export const browseNativeCategoryBarPosition = (top: number): ViewStyle => ({ top });
export const browseNativeCategoryScrollContent: ViewStyle = {
  paddingHorizontal: 16,
  paddingVertical: 8,
  gap: 8,
};
export const browseNativeCategoryButton = (active: boolean): ViewStyle => ({
  paddingHorizontal: 16,
  minHeight: 34,
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: designColors.ink,
  backgroundColor: active ? designColors.ink : designColors.ground,
});
export const browseNativeCategoryLabel = (active: boolean): TextStyle => ({
  color: active ? designColors.ground : designColors.ink,
  fontFamily: interFonts.semiBold,
  fontSize: 12,
  textTransform: 'uppercase',
});

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION (prototype .hero — black bg with noise)
// ═══════════════════════════════════════════════════════════════════════════════

export const browseHero: ViewStyle = {
  backgroundColor: designColors.ink,
  paddingTop: 96, // prototype: padding: 8rem 2rem 4rem
  paddingHorizontal: designSpacingSemantic.m,
  paddingBottom: 48,
  alignItems: 'center',
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

export const browseCategoriesInner = (isDesktop: boolean): ViewStyle => ({
  maxWidth: isDesktop ? 1400 : undefined,
  width: '100%' as DimensionValue,
  alignSelf: 'center' as const,
});

export const browseCategoryBtn: ViewStyle = {
  paddingVertical: 16,
  paddingHorizontal: 24,
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
  backgroundColor: designColors.ground,
  overflow: 'hidden',
};

export const browseCategoryBtnActive: ViewStyle = {
  ...browseCategoryBtn,
  backgroundColor: designColors.ink,
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CONTENT (prototype main)
// ═══════════════════════════════════════════════════════════════════════════════

export const browseMain = (isDesktop: boolean): ViewStyle => ({
  paddingVertical: 48,
  paddingHorizontal: designSpacingSemantic.m,
  maxWidth: isDesktop ? 1400 : undefined,
  width: '100%' as DimensionValue,
  alignSelf: 'center' as const,
});

export const browseHeader: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 32,
  flexWrap: 'wrap',
  gap: 16,
};

export const browseViewToggle: ViewStyle = {
  flexDirection: 'row',
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
  backgroundColor: designColors.ink,
};

export const browseSortSelect: ViewStyle = {
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
  backgroundColor: designColors.ground,
};

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS GRID (prototype .events-grid)
// ═══════════════════════════════════════════════════════════════════════════════

const GAP_DESKTOP = 32; // desktop prototype gap: 2rem
const GAP_MOBILE = 16;  // mobile prototype gap: --space-s (16px)

/** Multi-column grid row */
export const browseGridRow = (isNative = false): ViewStyle => {
  const gap = isNative ? GAP_MOBILE : GAP_DESKTOP;
  return {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -gap / 2,
  };
};

/** Single-column grid (list view) */
export const browseGridList = (isNative = false): ViewStyle => ({
  gap: isNative ? GAP_MOBILE : 16,
});

/** One cell in the multi-column grid */
export const browseGridCell = (columns: number, isNative = false): ViewStyle => {
  const gap = isNative ? GAP_MOBILE : GAP_DESKTOP;
  return {
    width: `${100 / columns}%` as DimensionValue,
    paddingHorizontal: gap / 2,
    marginBottom: gap,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD MORE (prototype .load-more)
// ═══════════════════════════════════════════════════════════════════════════════

export const browseLoadMore: ViewStyle = {
  alignItems: 'center',
  marginTop: 48,
};

export const browseLoadMoreBtn: ViewStyle = {
  paddingVertical: 16,
  paddingHorizontal: 48,
  backgroundColor: designColors.ground,
  borderWidth: designBorders.standard,
  borderColor: designColors.ink,
};

export const browseLoadMoreButtonStyle = (pressed: boolean, disabled: boolean): ViewStyle[] => [
  browseLoadMoreBtn,
  ...(pressed ? [browseLoadMorePressed] : []),
  ...(disabled ? [browseLoadMoreDisabled] : []),
];

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY / LOADING STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const browseEmpty: ViewStyle = {
  marginTop: 32,
  padding: 48,
  borderWidth: designBorders.standard,
  borderStyle: 'dashed',
  borderColor: designColors.ink,
  alignItems: 'center',
};

export const browseLoading: ViewStyle = {
  marginTop: 48,
  alignItems: 'center',
};
