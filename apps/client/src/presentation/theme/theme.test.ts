import { brand, neutral, status } from "./tokens";
import {
  darkColors,
  durationFor,
  getThemeColors,
  lightColors,
  prefersReducedMotion,
  themes,
  type ThemeColors,
} from "./theme";

const PAIRS: readonly [keyof ThemeColors, keyof ThemeColors][] = [
  ["background", "foreground"],
  ["card", "cardForeground"],
];

const REQUIRED_KEYS: readonly (keyof ThemeColors)[] = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "muted",
  "line",
  "brand",
  "ok",
  "warn",
  "error",
];

describe("RBT-003 semantic theme", () => {
  it.each(["light", "dark"] as const)(
    "%s scheme defines every required key as a non-empty string",
    (name) => {
      const scheme = themes[name];
      for (const key of REQUIRED_KEYS) {
        expect(typeof scheme[key]).toBe("string");
        expect(scheme[key].length).toBeGreaterThan(0);
      }
    },
  );

  it.each(["light", "dark"] as const)(
    "%s scheme ships a background+text PAIR for every surface (AC2)",
    (name) => {
      const scheme = themes[name];
      for (const [bg, fg] of PAIRS) {
        expect(scheme[bg]).toBeDefined();
        expect(scheme[fg]).toBeDefined();
        // A readable pair never collapses bg and fg to the same color.
        expect(scheme[bg]).not.toBe(scheme[fg]);
      }
    },
  );

  it("light scheme uses the prototype light values verbatim", () => {
    expect(lightColors).toEqual({
      background: neutral.paper,
      foreground: neutral.ink,
      card: neutral.card,
      cardForeground: neutral.ink,
      muted: neutral.muted,
      line: neutral.line,
      brand: brand.red,
      ok: status.ok,
      warn: status.warn,
      error: status.error,
    });
  });

  it("dark scheme inverts surfaces and uses dark-context status hues", () => {
    expect(darkColors.background).toBe(neutral.ink);
    expect(darkColors.foreground).toBe(neutral.paper);
    expect(darkColors.card).toBe(neutral.ink2);
    expect(darkColors.muted).toBe(neutral.mutedDark);
    expect(darkColors.ok).toBe(status.okDark);
    expect(darkColors.warn).toBe(status.warnDark);
    expect(darkColors.error).toBe(status.errorDark);
  });

  describe("getThemeColors", () => {
    it("returns dark only for the 'dark' scheme", () => {
      expect(getThemeColors("dark")).toBe(darkColors);
    });

    it("returns light for 'light'", () => {
      expect(getThemeColors("light")).toBe(lightColors);
    });

    it.each([null, undefined])("falls back to light for %s", (value) => {
      expect(getThemeColors(value)).toBe(lightColors);
    });
  });

  describe("durationFor", () => {
    it("passes the duration through when motion is allowed", () => {
      expect(durationFor(400, false)).toBe(400);
    });

    it("collapses to 0 when motion is reduced", () => {
      expect(durationFor(400, true)).toBe(0);
    });
  });

  describe("prefersReducedMotion", () => {
    it("is true only when reduce is explicitly enabled", () => {
      expect(prefersReducedMotion(true)).toBe(true);
    });

    it.each([false, null, undefined])("is false for %s", (value) => {
      expect(prefersReducedMotion(value)).toBe(false);
    });
  });
});
