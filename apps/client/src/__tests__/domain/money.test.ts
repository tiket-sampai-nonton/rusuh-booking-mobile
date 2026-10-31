import { minorToIDR } from "@domain/services/money";

describe("minorToIDR", () => {
  it("formats minor units into grouped Rupiah", () => {
    expect(minorToIDR(45000000)).toBe("Rp 450.000");
    expect(minorToIDR(30000000)).toBe("Rp 300.000");
    expect(minorToIDR(100)).toBe("Rp 1");
  });

  it("groups into millions correctly", () => {
    expect(minorToIDR(123456700)).toBe("Rp 1.234.567");
  });

  it("renders Rp 0 for zero", () => {
    expect(minorToIDR(0)).toBe("Rp 0");
  });

  it("defends against nullish / non-finite amounts", () => {
    expect(minorToIDR(undefined)).toBe("Rp 0");
    expect(minorToIDR(null)).toBe("Rp 0");
    expect(minorToIDR(NaN)).toBe("Rp 0");
    expect(minorToIDR(Infinity)).toBe("Rp 0");
  });

  it("handles a negative amount with a leading sign", () => {
    expect(minorToIDR(-45000000)).toBe("-Rp 450.000");
  });

  it("formats an amount below one major unit as Rp 0", () => {
    expect(minorToIDR(50)).toBe("Rp 0");
  });
});

describe("minorToIDR — compact (card label, prototype parity)", () => {
  it("renders thousands as 'rb'", () => {
    expect(minorToIDR(45000000, { compact: true })).toBe("Rp 450rb");
    expect(minorToIDR(32500000, { compact: true })).toBe("Rp 325rb");
  });

  it("renders millions as 'jt' with an Indonesian decimal comma", () => {
    expect(minorToIDR(150000000, { compact: true })).toBe("Rp 1,5jt");
    expect(minorToIDR(100000000, { compact: true })).toBe("Rp 1jt"); // trailing .0 cut
    expect(minorToIDR(250000000, { compact: true })).toBe("Rp 2,5jt");
  });

  it("falls back to the grouped form below Rp 1.000", () => {
    expect(minorToIDR(50000, { compact: true })).toBe("Rp 500");
  });

  it("compact is a no-op for zero / nullish", () => {
    expect(minorToIDR(0, { compact: true })).toBe("Rp 0");
    expect(minorToIDR(undefined, { compact: true })).toBe("Rp 0");
  });

  it("keeps the leading sign on a negative compact amount", () => {
    expect(minorToIDR(-45000000, { compact: true })).toBe("-Rp 450rb");
  });
});
