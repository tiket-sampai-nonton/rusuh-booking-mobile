import { minorToIDR } from "@domain/services/money";

describe("minorToIDR", () => {
  it("formats whole Rupiah values with dot thousands", () => {
    expect(minorToIDR(275000)).toBe("Rp 275.000");
    expect(minorToIDR(100)).toBe("Rp 100");
    expect(minorToIDR(1234567)).toBe("Rp 1.234.567");
  });

  it("renders Rp 0 for a nullish or non-finite amount", () => {
    expect(minorToIDR(undefined)).toBe("Rp 0");
    expect(minorToIDR(null)).toBe("Rp 0");
    expect(minorToIDR(Number.NaN)).toBe("Rp 0");
    expect(minorToIDR(0)).toBe("Rp 0");
  });

  it("always keeps the entire amount visible", () => {
    expect(minorToIDR(1000000)).toBe("Rp 1.000.000");
    expect(minorToIDR(450000)).toBe("Rp 450.000");
    expect(minorToIDR(1200000)).toBe("Rp 1.200.000");
  });

  it("handles a negative amount with a leading sign", () => {
    expect(minorToIDR(-450000)).toBe("-Rp 450.000");
    expect(minorToIDR(-450000000)).toBe("-Rp 450.000.000");
  });
});
