/**
 * RBT-089 — V2 Brutalist Mono Browse Screen Styles
 *
 * PROTOTYPE 05-browse.html EXACT COPY:
 * - White background (var(--white)), black ink (var(--black))
 * - 2px solid borders everywhere
 * - Inter font family (900 black, 700 bold)
 * - Hero: black bg with noise texture, search box
 * - Categories: button grid with fill-up hover
 * - Cards: grayscale→color on hover, 8px shadow offset
 * - No rounded corners anywhere
 */
import { type DimensionValue, type ViewStyle } from 'react-native';

import { v2Colors, v2Borders, v2SpacingSemantic } from '@presentation/theme';

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

/** Scroll content: max-width container on desktop (prototype max-width: 1400px) */
export const browseScrollContent = (bottom: number, isDesktop: boolean): ViewStyle => ({
  paddingBottom: bottom + 48,
  ...(isDesktop
    ? {
        maxWidth: 1400,
        width: '100%' as DimensionValue,
        alignSelf: 'center' as const,
      }
    : {}),
});

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION (prototype .hero — black bg with noise)
// ═══════════════════════════════════════════════════════════════════════════════

export const browseHero: ViewStyle = {
  backgroundColor: v2Colors.ink,
  paddingTop: 96, // prototype: padding: 8rem 2rem 4rem
  paddingHorizontal: v2SpacingSemantic.m,
  paddingBottom: 48,
  alignItems: 'center',
};

export const browseHeroTitle: ViewStyle = {
  marginBottom: 24,
};

export const browseSearchBox: ViewStyle = {
  flexDirection: 'row',
  maxWidth: 600,
  width: '100%',
  borderWidth: v2Borders.standard,
  borderColor: v2Colors.ground,
};

export const browseSearchInput = {
  flex: 1,
  paddingVertical: 16,
  paddingHorizontal: 24,
  backgroundColor: 'transparent',
};

export const browseSearchBtn: ViewStyle = {
  paddingVertical: 16,
  paddingHorizontal: 32,
  backgroundColor: v2Colors.ground,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES SECTION (prototype .categories)
// ═══════════════════════════════════════════════════════════════════════════════

export const browseCategories: ViewStyle = {
  paddingVertical: 48,
  paddingHorizontal: v2SpacingSemantic.m,
  backgroundColor: v2Colors.ground,
  borderBottomWidth: v2Borders.standard,
  borderBottomColor: v2Colors.ink,
};

export const browseCategoriesInner = (isDesktop: boolean): ViewStyle => ({
  maxWidth: isDesktop ? 1400 : undefined,
  width: '100%' as DimensionValue,
  alignSelf: 'center' as const,
});

export const browseCategoryBtn: ViewStyle = {
  paddingVertical: 16,
  paddingHorizontal: 24,
  borderWidth: v2Borders.standard,
  borderColor: v2Colors.ink,
  backgroundColor: v2Colors.ground,
  overflow: 'hidden',
};

export const browseCategoryBtnActive: ViewStyle = {
  ...browseCategoryBtn,
  backgroundColor: v2Colors.ink,
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CONTENT (prototype main)
// ═══════════════════════════════════════════════════════════════════════════════

export const browseMain = (isDesktop: boolean): ViewStyle => ({
  paddingVertical: 48,
  paddingHorizontal: v2SpacingSemantic.m,
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
  borderWidth: v2Borders.standard,
  borderColor: v2Colors.ink,
};

export const browseViewBtn: ViewStyle = {
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: v2Colors.ground,
};

export const browseViewBtnActive: ViewStyle = {
  ...browseViewBtn,
  backgroundColor: v2Colors.ink,
};

export const browseSortSelect: ViewStyle = {
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderWidth: v2Borders.standard,
  borderColor: v2Colors.ink,
  backgroundColor: v2Colors.ground,
};

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS GRID (prototype .events-grid)
// ═══════════════════════════════════════════════════════════════════════════════

const GAP = 32; // prototype gap: 2rem

/** Multi-column grid row (desktop) */
export const browseGridRow: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginHorizontal: -GAP / 2,
};

/** Single-column grid (mobile) */
export const browseGridList: ViewStyle = {
  gap: GAP,
};

/** One cell in the multi-column grid */
export const browseGridCell = (columns: number): ViewStyle => ({
  width: `${100 / columns}%` as DimensionValue,
  paddingHorizontal: GAP / 2,
  marginBottom: GAP,
});

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
  backgroundColor: v2Colors.ground,
  borderWidth: v2Borders.standard,
  borderColor: v2Colors.ink,
};

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY / LOADING STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const browseEmpty: ViewStyle = {
  marginTop: 32,
  padding: 48,
  borderWidth: v2Borders.standard,
  borderStyle: 'dashed',
  borderColor: v2Colors.ink,
  alignItems: 'center',
};

export const browseLoading: ViewStyle = {
  marginTop: 48,
  alignItems: 'center',
};
