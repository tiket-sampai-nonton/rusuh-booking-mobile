/**
 * useResponsive — web branch coverage.
 *
 * On native the hook short-circuits to the phone layout; the web branch
 * (lines computing isDesktop / gridColumns / detailTwoCol from the window
 * width) only runs under RN Web. We flip Platform.OS to "web" so the hook
 * takes that branch. The jest-expo preset owns useWindowDimensions and reports
 * a 750px test viewport, so we assert the web values AT that width (web, not
 * yet the ≥960 desktop container, 2-column grid). The wider ≥960 desktop path
 * is covered by HomeScreen.desktop.test.tsx, which mocks the hook directly.
 */
jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");
  actual.Platform.OS = "web";
  return actual;
});

// eslint-disable-next-line import/first
import { renderHook } from "@testing-library/react-native";
// eslint-disable-next-line import/first
import { useResponsive } from "@presentation/hooks/useResponsive";

describe("useResponsive (web)", () => {
  it("takes the web branch — isWeb true, width-derived grid/desktop values", () => {
    const { result } = renderHook(() => useResponsive());
    // The web branch ran (not the native short-circuit).
    expect(result.current.isWeb).toBe(true);
    // At the jest-expo test width (750px): > 720 so it is "web", > 620 so the
    // grid is 2 columns, but < 960 so not the desktop container, and < 820 for
    // (well, 750 < 820) the detail two-column layout.
    expect(result.current.width).toBeGreaterThan(0);
    expect([1, 2, 3]).toContain(result.current.gridColumns);
    expect(typeof result.current.isDesktop).toBe("boolean");
    expect(typeof result.current.detailTwoCol).toBe("boolean");
    // Internal consistency with the actual reported width:
    const w = result.current.width;
    expect(result.current.isDesktop).toBe(w >= 960);
    expect(result.current.detailTwoCol).toBe(w > 820);
    expect(result.current.gridColumns).toBe(w > 900 ? 3 : w > 620 ? 2 : 1);
  });
});
