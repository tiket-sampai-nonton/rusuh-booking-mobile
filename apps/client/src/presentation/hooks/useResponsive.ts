/**
 * useResponsive — web-desktop layout detection.
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
 */
import { Platform, useWindowDimensions } from "react-native";

export interface Responsive {
  readonly isWeb: boolean;
  /** Web AND wide enough for the desktop container layout (≥ 960px). */
  readonly isDesktop: boolean;
  readonly width: number;
  /** Event-grid column count (prototype index.html breakpoints). */
  readonly gridColumns: 1 | 2 | 3;
  /** True when the detail page should use its 2-column desktop layout. */
  readonly detailTwoCol: boolean;
}

export function useResponsive(): Responsive {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  if (!isWeb) {
    // Native: always phone layout, regardless of device width (tablets keep
    // the single-column mobile design the prototype targets).
    return { isWeb: false, isDesktop: false, width, gridColumns: 1, detailTwoCol: false };
  }

  const gridColumns: 1 | 2 | 3 = width > 900 ? 3 : width > 620 ? 2 : 1;
  return {
    isWeb: true,
    isDesktop: width >= 960,
    width,
    gridColumns,
    detailTwoCol: width > 820,
  };
}
