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

  it("compact: ≥ 1jt uses a comma decimal and trims trailing .0", () => {
    // 450jt major → 45.000.000.000 minor (divisor 100)
    expect(minorToIDR(45000000000, { compact: true })).toBe("Rp 450jt");
    // 1,2jt major → 120.000.000 minor
    expect(minorToIDR(120000000, { compact: true })).toBe("Rp 1,2jt");
  });

  it("compact: ≥ 1rb but < 1jt rounds to the nearest thousand", () => {
    // 450rb major → 45.000.000 minor
    expect(minorToIDR(45000000, { compact: true })).toBe("Rp 450rb");
  });

  it("compact: < 1rb falls back to the grouped form", () => {
    expect(minorToIDR(50000, { compact: true })).toBe("Rp 500");
  });

  it("handles a negative amount with a leading sign", () => {
    expect(minorToIDR(-45000000)).toBe("-Rp 450.000");
    expect(minorToIDR(-45000000000, { compact: true })).toBe("-Rp 450jt");
  });
});
