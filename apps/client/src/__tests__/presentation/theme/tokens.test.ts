import tailwind from "../../../../tailwind.config.js";

import {
  brand,
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
} from "../../../presentation/theme/tokens";

const tailwindBrand = (
  tailwind as {
    theme?: {
      extend?: { colors?: { brand?: Record<string, string> } };
    };
  }
).theme?.extend?.colors?.brand;

describe("RBT-003 raw tokens", () => {
  it("exposes the cyberpunk brand hues", () => {
    expect(brand.purple).toBe("#7C3AED");
    expect(brand.purpleDeep).toBe("#5B21B6");
    expect(brand.magenta).toBe("#FF32C8");
    expect(brand.cyan).toBe("#007F9E");
    expect(brand.neonCyan).toBe("#49E8FF");
  });

  it("mirrors the Tailwind brand palette as the canonical token source", () => {
    if (!tailwindBrand) {
      throw new Error("Tailwind brand color tokens are unavailable");
    }

    expect(brand.purple).toBe(tailwindBrand.DEFAULT);
    expect(brand.purpleDeep).toBe(tailwindBrand.deep);
    expect(brand.magenta).toBe(tailwindBrand.ember);
    expect(brand.cyan).toBe(tailwindBrand.cyan);
    expect(brand.neonCyan).toBe(tailwindBrand["neon-cyan"]);
  });

  it("exposes light + dark status hues", () => {
    expect(status).toMatchObject({
      ok: "#087F68",
      okDark: "#5EEAD4",
      warn: "#9A5B00",
      warnDark: "#FFD166",
      error: "#C02677",
      errorDark: "#FF7AB6",
    });
  });

  it("exposes prototype neutral/surface hues", () => {
    expect(neutral.ink).toBe("#1B1026");
    expect(neutral.ink2).toBe("#28113D");
    expect(neutral.paper).toBe("#F7F2FF");
    expect(neutral.card).toBe("#FFFCFF");
    expect(neutral.darkBackground).toBe("#0B0614");
    expect(neutral.darkCard).toBe("#170D24");
    expect(neutral.darkForeground).toBe("#F7F2FF");
    expect(neutral.overlay).toBe("#0B0614");
    expect(neutral.muted).toBe("#665873");
    expect(neutral.line).toBe("rgba(43,19,67,0.14)");
    expect(neutral.mutedDark).toBe("#C7B8D8");
    expect(neutral.lineDark).toBe("rgba(220,190,255,0.18)");
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
    expect(shadow.brand).toContain("rgba(124,58,237,0.48)");
    expect(shadow.button).toContain("rgba(27,16,38,0.42)");
    expect(shadow.filter).toContain("rgba(43,19,67,0.5)");
    expect(shadow.ok).toContain("rgba(8,127,104,0.45)");
  });

  it("the tokens bag re-exports every group by reference", () => {
    expect(tokens).toEqual({
      brand,
      status,
      neutral,
      radius,
      spacing,
      fontSize,
      fontWeight,
      fontFamily,
      motion,
      shadow,
    });
    expect(tokens.brand).toBe(brand);
    expect(tokens.motion).toBe(motion);
  });
});
