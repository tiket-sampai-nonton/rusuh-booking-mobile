/**
 * useResponsive — web-desktop layout detection + mobile/native differentiation.
 *
 * When the app runs under React Native Web, the prototype's DESKTOP layout
 * should apply (centered max-width containers, multi-column grids, the detail
 * 2-column buy-box layout). On NATIVE this hook always reports phone values
 * (`isWeb=false`, `isDesktop=false`, `columns=1`), so native layout is never
 * affected — every desktop branch is gated behind `isWeb`/`isDesktop`.
 *
 * Breakpoints mirror the prototype media queries:
 *   - event grid: 3 cols > 900px, 2 cols > 620px, else 1  (index.html)
 *   - detail layout: 2 cols (1fr/320px) > 820px, else 1    (event.html)
 *   - desktop "container" kicks in at ≥ 960px wide
 *
 * Mobile-specific values (v2-mobile prototype):
 *   - headerHeight: 56px (vs 60px desktop)
 *   - bottomBarHeight: 72px (mobile nav only)
 *   - heroHeight: 70vh (vs 100vh desktop)
 *   - tapTarget: 44px minimum
 */
import { Platform, useWindowDimensions } from "react-native";

import { v2Layout } from "@presentation/theme";

export interface Responsive {
  readonly isWeb: boolean;
  /** Native platform (iOS/Android) — always phone layout */
  readonly isNative: boolean;
  /** Web AND wide enough for the desktop container layout (≥ 960px). */
  readonly isDesktop: boolean;
  readonly width: number;
  readonly height: number;
  /** Event-grid column count (prototype index.html breakpoints). */
  readonly gridColumns: 1 | 2 | 3;
  /** True when the detail page should use its 2-column desktop layout. */
  readonly detailTwoCol: boolean;
  /** Header height: 56px mobile, 60px desktop */
  readonly headerHeight: number;
  /** Hero height as percentage of viewport: 70/80 for mobile, 100 for desktop */
  readonly heroHeightVh: 70 | 80 | 100;
  /** Bottom bar height (mobile nav): 72px on native, 0 on web */
  readonly bottomBarHeight: number;
  /** Minimum tap target size: 44px */
  readonly tapTarget: number;
}

export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isNative = !isWeb;

  if (isNative) {
    // Native: always phone layout with mobile-specific values
    return {
      isWeb: false,
      isNative: true,
      isDesktop: false,
      width,
      height,
      gridColumns: 1,
      detailTwoCol: false,
      headerHeight: v2Layout.headerHeightMobile,
      heroHeightVh: 70,
      bottomBarHeight: v2Layout.bottomBarHeight,
      tapTarget: v2Layout.tapTarget,
    };
  }

  // Web: responsive based on viewport width
  const gridColumns: 1 | 2 | 3 = width > 900 ? 3 : width > 620 ? 2 : 1;
  const isDesktop = width >= 960;

  return {
    isWeb: true,
    isNative: false,
    isDesktop,
    width,
    height,
    gridColumns,
    detailTwoCol: width > 820,
    headerHeight: isDesktop ? v2Layout.headerHeight : v2Layout.headerHeightMobile,
    heroHeightVh: isDesktop ? 100 : 70,
    bottomBarHeight: 0, // Web uses top nav, no bottom bar
    tapTarget: v2Layout.tapTarget,
  };
}
