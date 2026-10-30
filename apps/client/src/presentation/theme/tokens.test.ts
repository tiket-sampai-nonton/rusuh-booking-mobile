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
} from "./tokens";

describe("RBT-003 raw tokens", () => {
  it("exposes the exact prototype brand hues", () => {
    expect(brand.red).toBe("#EC1C24");
    expect(brand.redDeep).toBe("#a8111b");
    expect(brand.ember).toBe("#ff5a2d");
  });

  it("exposes light + dark status hues", () => {
    expect(status).toMatchObject({
      ok: "#17a34a",
      okDark: "#4ade80",
      warn: "#e8830c",
      warnDark: "#f5b301",
      error: "#EC1C24",
      errorDark: "#ff6a4c",
    });
  });

  it("exposes prototype neutral/surface hues", () => {
    expect(neutral.ink).toBe("#0a0a0c");
    expect(neutral.ink2).toBe("#121217");
    expect(neutral.paper).toBe("#fbfbfd");
    expect(neutral.card).toBe("#ffffff");
    expect(neutral.muted).toBe("#6b6b76");
    expect(neutral.line).toBe("rgba(10,10,12,0.08)");
    expect(neutral.mutedDark).toBe("rgba(255,255,255,0.62)");
    expect(neutral.lineDark).toBe("rgba(255,255,255,0.12)");
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

  it("font family starts with Plus Jakarta Sans and ends with sans-serif", () => {
    expect(fontFamily[0]).toBe("Plus Jakarta Sans");
    expect(fontFamily[fontFamily.length - 1]).toBe("sans-serif");
  });

  it("motion carries the prototype ease in both CSS and bezier form", () => {
    expect(motion.ease).toBe("cubic-bezier(0.32, 0.72, 0, 1)");
    expect(motion.easeBezier).toEqual([0.32, 0.72, 0, 1]);
    expect(motion.duration[400]).toBe(400);
    expect(Object.values(motion.duration)).toEqual([250, 350, 400, 600, 700]);
  });

  it("shadow strings are present for the four prototype elevations", () => {
    expect(shadow.brand).toContain("rgba(236,28,36,0.5)");
    expect(shadow.button).toContain("rgba(0,0,0,0.5)");
    expect(shadow.filter).toContain("rgba(10,10,12,0.5)");
    expect(shadow.ok).toContain("rgba(23,163,74,0.7)");
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
