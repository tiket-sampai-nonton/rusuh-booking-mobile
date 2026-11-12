import tailwind from "../../../../tailwind.config.js";

import {
  designColors,
  designBorder,
  designFont,
  designMotion,
  designTokens,
  designZone,
  designBorders,
  designFonts,
  designEasing,
  designEasingCSS,
  designZoneBanners,
} from "../../../presentation/theme/event-design-tokens";

// The tailwind config's v2 color namespace — the single source of truth the
// raw tokens must mirror.
const tw = (
  tailwind as {
    theme?: { extend?: { colors?: { v2?: Record<string, string> } } };
  }
).theme?.extend?.colors?.v2 as Record<string, string> | undefined;

describe("RBT-096  Brutalist Mono tokens (Re-implementation)", () => {
  describe("designColors", () => {
    it("exposes the black, white, and neon cyberpunk brand palette", () => {
      expect(designColors).toMatchObject({
        ground: "#FBFBFD",
        ink: "#0A0A0C",
        overlay: "#0A0A0C",
        inkMuted: "#666666",
        field: "#F5F5F5",
        danger: "#C1121F",
        success: "#00AA00",
        warning: "#FF6600",
      });
    });

    it("includes legacy aliases for backwards compatibility", () => {
      expect(designColors.muted).toBe("#666666");
      expect(designColors.warn).toBe("#FF6600");
      expect(designColors.accent).toBe("#DE00A0");
      expect(designColors.ember).toBe("#00E5FF");
    });
  });

  describe("designBorders (new API)", () => {
    it("defines border widths per MASTER-SPEC §1", () => {
      expect(designBorders.standard).toBe(2);
      expect(designBorders.thick).toBe(3); // Waiting room only
      expect(designBorders.thin).toBe(1);
    });
  });

  describe("designBorder legacy alias", () => {
    it("maps to designBorders for backwards compatibility", () => {
      expect(designBorder.base).toBe(designBorders.standard);
      expect(designBorder.heavy).toBe(designBorders.thick);
    });
  });

  describe("designFonts (new API)", () => {
    it("defines fonts per MASTER-SPEC §1", () => {
      expect(designFonts.sans).toBe("Plus Jakarta Sans");
    });
  });

  describe("designFont legacy alias", () => {
    it("is an alias for designFonts for backwards compatibility", () => {
      expect(designFont).toBe(designFonts);
    });
  });

  describe("designEasing (new API)", () => {
    it("exposes easing curves as Reanimated bezier tuples", () => {
      expect(designEasing.primary).toEqual([0.16, 1, 0.3, 1]);
      expect(designEasing.out).toEqual([0.33, 1, 0.68, 1]);
      expect(designEasing.elastic).toEqual([0.68, -0.6, 0.32, 1.6]);
    });
  });

  describe("designEasingCSS (new API)", () => {
    it("exposes easing curves as CSS cubic-bezier strings", () => {
      expect(designEasingCSS.primary).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
      expect(designEasingCSS.out).toBe("cubic-bezier(0.33, 1, 0.68, 1)");
    });
  });

  describe("designMotion legacy alias", () => {
    it("maps to designEasingCSS for backwards compatibility", () => {
      expect(designMotion.ease).toBe(designEasingCSS.primary);
      expect(designMotion.easeBezier).toEqual(designEasing.primary);
      expect(designMotion.elasticBezier).toEqual(designEasing.elastic);
    });
  });

  describe("designZoneBanners (new API)", () => {
    it("defines waiting room zone banner colors per MASTER-SPEC §3.3", () => {
      expect(designZoneBanners.guaranteed).toEqual({
        bg: "#E8F5E9",
        border: "#00AA00",
        text: "#1B5E20",
      });
      expect(designZoneBanners.possible).toEqual({
        bg: "#FFF3E0",
        border: "#FF6600",
        text: "#E65100",
      });
      expect(designZoneBanners.notEnough).toEqual({
        bg: "#FCE8EA",
        border: "#C1121F",
        text: "#7F1D1D",
      });
    });
  });

  describe("designZone legacy alias", () => {
    it("maps to designZoneBanners for backwards compatibility", () => {
      expect(designZone.ok).toEqual(designZoneBanners.guaranteed);
      expect(designZone.warn).toEqual(designZoneBanners.possible);
      expect(designZone.bad).toEqual(designZoneBanners.notEnough);
    });
  });

  describe("designTokens (new API)", () => {
    it("bundles all token groups", () => {
      expect(designTokens.colors).toBe(designColors);
      expect(designTokens.borders).toBe(designBorders);
      expect(designTokens.fonts).toBe(designFonts);
      expect(designTokens.easing).toBe(designEasing);
      expect(designTokens.easingCSS).toBe(designEasingCSS);
      expect(designTokens.zoneBanners).toBe(designZoneBanners);
    });
  });

  // Only run tailwind sync tests if tw is available
  if (tw) {
    describe("Tailwind sync", () => {
      it("MIRRORS the tailwind.config.js v2 namespace for core colors", () => {
        // Every core raw token equals its tailwind counterpart — no drift.
        (["ink", "ground", "field", "overlay", "accent"] as const).forEach(
          (k) => {
            if (tw[k]) {
              expect(designColors[k]).toBe(tw[k]);
            }
          },
        );
      });
    });
  }
});
