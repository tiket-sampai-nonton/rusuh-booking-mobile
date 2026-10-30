import { APP_NAME, clamp } from "@shared/utils/clamp";

describe("shared/clamp", () => {
  it("exposes the app name", () => {
    expect(APP_NAME).toBe("Rusuh Booking");
  });

  it("returns the value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps below the minimum", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it("clamps above the maximum", () => {
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it("throws when min > max", () => {
    expect(() => clamp(1, 10, 0)).toThrow(RangeError);
  });
});
