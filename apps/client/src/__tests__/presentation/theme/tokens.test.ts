import tailwind from "../../../../tailwind.config.js";

import {
  brand,
  brandMark,
  fontFamily,
  fontSize,
  fontWeight,
  motion,
  neutral,
  radius,
  shadow,
  spacing,
  status,
  tokens,
  zone,
} from "../../../presentation/theme/tokens";

const tailwindBrand = (
  tailwind as {
    theme?: {
      extend?: { colors?: { brand?: Record<string, string> } };
    };
  }
).theme?.extend?.colors?.brand;

describe("RBT-003 raw tokens", () => {
  it("exposes the black, white, and neon cyberpunk brand palette", () => {
    expect(brand.primary).toBe("#DE00A0");
    expect(brand.deep).toBe("#730050");
    expect(brand.ember).toBe("#00E5FF");
  });

  it("keeps the existing ticket mark colors unchanged", () => {
    expect(brandMark).toEqual({ primary: "#EC1C24", deep: "#A8111B" });
  });

  it("mirrors the Tailwind brand palette as the canonical token source", () => {
    if (!tailwindBrand) {
      throw new Error("Tailwind brand color tokens are unavailable");
    }

    expect(brand.primary).toBe(tailwindBrand.DEFAULT);
    expect(brand.deep).toBe(tailwindBrand.deep);
    expect(brand.ember).toBe(tailwindBrand.ember);
  });

  it("exposes light + dark status hues", () => {
    expect(status).toMatchObject({
      ok: "#00AA00",
      okDark: "#4ADE80",
      warn: "#FF6600",
      warnDark: "#F5B301",
      error: "#C1121F",
      errorDark: "#FF6B81",
    });
  });

  it("exposes prototype neutral/surface hues", () => {
    expect(neutral.ink).toBe("#0A0A0C");
    expect(neutral.ink2).toBe("#121217");
    expect(neutral.paper).toBe("#FBFBFD");
    expect(neutral.card).toBe("#FFFFFF");
    expect(neutral.darkBackground).toBe("#0A0A0C");
    expect(neutral.darkCard).toBe("#121217");
    expect(neutral.darkForeground).toBe("#FFFFFF");
    expect(neutral.overlay).toBe("#0A0A0C");
    expect(neutral.muted).toBe("#666666");
    expect(neutral.line).toBe("rgba(10,10,12,0.14)");
    expect(neutral.mutedDark).toBe("rgba(255,255,255,0.62)");
    expect(neutral.lineDark).toBe("rgba(255,255,255,0.18)");
    expect(neutral.field).toBe("#F5F5F5");
  });

  it("mirrors waiting-room zone colors from Tailwind", () => {
    expect(zone.ok).toEqual({
      bg: "#E8F5E9",
      border: "#00AA00",
      text: "#1B5E20",
    });
    expect(zone.warn).toEqual({
      bg: "#FFF3E0",
      border: "#FF6600",
      text: "#E65100",
    });
    expect(zone.bad).toEqual({
      bg: "#FCE8EA",
      border: "#C1121F",
      text: "#7F1D1D",
    });
  });

  it("radius set has every prototype step and the pill", () => {
    expect(Object.keys(radius)).toEqual([
      "mk",
      "sm",
      "base",
      "md",
      "lg",
      "xl",
      "2xl",
      "3xl",
      "4xl",
      "5xl",
      "pill",
    ]);
    expect(radius.mk).toBe(7);
    expect(radius.pill).toBe(999);
  });

  it("spacing keys map to the prototype px paddings", () => {
    expect(spacing[1.5]).toBe(6);
    expect(spacing[3.25]).toBe(13);
    expect(spacing[7.5]).toBe(30);
    expect(Object.keys(spacing)).toHaveLength(11);
  });

  it("font scale spans micro → hero", () => {
    expect(fontSize.micro).toBe(8);
    expect(fontSize.base).toBe(14);
    expect(fontSize.hero).toBe(48);
    expect(Object.keys(fontSize)).toHaveLength(12);
  });

  it("font weights are the prototype 600/700/800 set", () => {
    expect(fontWeight).toEqual({
      semibold: "600",
      bold: "700",
      extrabold: "800",
    });
  });

  it("font family starts with the bundled Plus Jakarta Sans face and ends with sans-serif", () => {
    expect(fontFamily[0]).toBe("PlusJakartaSans_400Regular");
    expect(fontFamily[fontFamily.length - 1]).toBe("sans-serif");
  });

  it("motion carries the prototype ease in both CSS and bezier form", () => {
    expect(motion.ease).toBe("cubic-bezier(0.32, 0.72, 0, 1)");
    expect(motion.easeBezier).toEqual([0.32, 0.72, 0, 1]);
    expect(motion.duration[400]).toBe(400);
    expect(Object.values(motion.duration)).toEqual([250, 350, 400, 600, 700]);
  });

  it("shadow strings are present for the four prototype elevations", () => {
    expect(shadow.brand).toContain("rgba(222,0,160,0.28)");
    expect(shadow.button).toContain("rgba(10,10,12,0.42)");
    expect(shadow.filter).toContain("rgba(18,18,23,0.5)");
    expect(shadow.ok).toContain("rgba(0,170,0,0.36)");
  });

  it("the tokens bag re-exports every group by reference", () => {
    expect(tokens).toEqual({
      brand,
      brandMark,
      status,
      neutral,
      zone,
      radius,
      spacing,
      fontSize,
      fontWeight,
      fontFamily,
      motion,
      shadow,
    });
    expect(tokens.brand).toBe(brand);
    expect(tokens.brandMark).toBe(brandMark);
    expect(tokens.motion).toBe(motion);
    expect(tokens.zone).toBe(zone);
  });
});
