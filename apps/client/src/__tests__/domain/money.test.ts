import { minorToIDR } from "@domain/services/money";

describe("minorToIDR", () => {
  it("formats a plain grouped amount (minor → major, dot thousands)", () => {
    expect(minorToIDR(45000000)).toBe("Rp 450.000");
    expect(minorToIDR(100)).toBe("Rp 1");
    expect(minorToIDR(123456700)).toBe("Rp 1.234.567");
  });

  it("renders Rp 0 for a nullish or non-finite amount", () => {
    expect(minorToIDR(undefined)).toBe("Rp 0");
    expect(minorToIDR(null)).toBe("Rp 0");
    expect(minorToIDR(Number.NaN)).toBe("Rp 0");
    expect(minorToIDR(0)).toBe("Rp 0");
  });

  it("always keeps the entire amount visible", () => {
    expect(minorToIDR(1000000)).toBe("Rp 10.000");
    expect(minorToIDR(45000000)).toBe("Rp 450.000");
    expect(minorToIDR(120000000)).toBe("Rp 1.200.000");
  });

  it("handles a negative amount with a leading sign", () => {
    expect(minorToIDR(-45000000)).toBe("-Rp 450.000");
    expect(minorToIDR(-45000000000)).toBe("-Rp 450.000.000");
  });
});
