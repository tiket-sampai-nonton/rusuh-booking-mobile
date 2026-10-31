/**
 * tap-target helper (RBT-090) — pure math, real assertions.
 */
import { TAP_MIN, tapSlop, tapSlopSquare } from "@shared/utils/tap-target";

describe("tap-target", () => {
  it("TAP_MIN is the WCAG 2.5.5 / Apple 44pt floor", () => {
    expect(TAP_MIN).toBe(44);
  });

  it("pads a short control up to the floor on the Y axis only", () => {
    // 120×33 chip → width already ≥44 (0), height 33 needs +11 split 5.5→6.
    expect(tapSlop(120, 33)).toEqual({ left: 0, right: 0, top: 6, bottom: 6 });
  });

  it("pads both axes for a small control", () => {
    // 20×20 → needs +24 each axis, split 12/12.
    expect(tapSlop(20, 20)).toEqual({ left: 12, right: 12, top: 12, bottom: 12 });
  });

  it("returns zero padding when already at/above the floor", () => {
    expect(tapSlop(60, 50)).toEqual({ left: 0, right: 0, top: 0, bottom: 0 });
  });

  it("never returns negative padding", () => {
    const s = tapSlop(100, 100);
    expect(s.top).toBeGreaterThanOrEqual(0);
    expect(s.left).toBeGreaterThanOrEqual(0);
  });

  it("honors a custom minimum", () => {
    // Material 48dp floor: 32-tall → +16 split 8/8.
    expect(tapSlop(100, 32, 48)).toEqual({ left: 0, right: 0, top: 8, bottom: 8 });
  });

  it("tapSlopSquare pads a square icon button symmetrically", () => {
    expect(tapSlopSquare(24)).toEqual({ left: 10, right: 10, top: 10, bottom: 10 });
  });
});
