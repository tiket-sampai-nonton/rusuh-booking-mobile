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
  it("exposes the green and yellow brand palette", () => {
    expect(brand.primary).toBe("#15803D");
    expect(brand.deep).toBe("#166534");
    expect(brand.yellow).toBe("#FACC15");
    expect(brand.yellowDeep).toBe("#A16207");
    expect(brand.yellowLight).toBe("#FEF08A");
  });

  it("mirrors the Tailwind brand palette as the canonical token source", () => {
    if (!tailwindBrand) {
      throw new Error("Tailwind brand color tokens are unavailable");
    }

    expect(brand.primary).toBe(tailwindBrand.DEFAULT);
    expect(brand.deep).toBe(tailwindBrand.deep);
    expect(brand.yellow).toBe(tailwindBrand.yellow);
    expect(brand.yellowDeep).toBe(tailwindBrand["yellow-deep"]);
    expect(brand.yellowLight).toBe(tailwindBrand["yellow-light"]);
  });

  it("exposes light + dark status hues", () => {
    expect(status).toMatchObject({
      ok: "#15803D",
      okDark: "#86EFAC",
      warn: "#A16207",
      warnDark: "#FDE047",
      error: "#B42318",
      errorDark: "#FDA29B",
    });
  });

  it("exposes prototype neutral/surface hues", () => {
    expect(neutral.ink).toBe("#142519");
    expect(neutral.ink2).toBe("#24452E");
    expect(neutral.paper).toBe("#F6F9F4");
    expect(neutral.card).toBe("#FFFFFF");
    expect(neutral.darkBackground).toBe("#0B1710");
    expect(neutral.darkCard).toBe("#13251A");
    expect(neutral.darkForeground).toBe("#F1F8F1");
    expect(neutral.overlay).toBe("#0B1710");
    expect(neutral.muted).toBe("#58665A");
    expect(neutral.line).toBe("rgba(20,37,25,0.14)");
    expect(neutral.mutedDark).toBe("#B7C8BA");
    expect(neutral.lineDark).toBe("rgba(213,237,219,0.18)");
    expect(neutral.field).toBe("#EAF2E7");
  });

  it("mirrors waiting-room zone colors from Tailwind", () => {
    expect(zone.ok).toEqual({
      bg: "#E9F6EC",
      border: "#15803D",
      text: "#14532D",
    });
    expect(zone.warn).toEqual({
      bg: "#FEF9C3",
      border: "#A16207",
      text: "#713F12",
    });
    expect(zone.bad).toEqual({
      bg: "#FEF2F2",
      border: "#B42318",
      text: "#991B1B",
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
    expect(shadow.brand).toContain("rgba(21,128,61,0.28)");
    expect(shadow.button).toContain("rgba(20,37,25,0.42)");
    expect(shadow.filter).toContain("rgba(36,69,46,0.5)");
    expect(shadow.ok).toContain("rgba(21,128,61,0.36)");
  });

  it("the tokens bag re-exports every group by reference", () => {
    expect(tokens).toEqual({
      brand,
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
    expect(tokens.motion).toBe(motion);
    expect(tokens.zone).toBe(zone);
  });
});
