import { PAYMENT_METHODS, methodMeta } from "@domain/rules/payment-method";

describe("PAYMENT_METHODS", () => {
  it("offers the six contract buckets, no credit card", () => {
    const codes = PAYMENT_METHODS.map((m) => m.code);
    expect(codes).toEqual([
      "VA_BCA",
      "VA_BNI",
      "VA_BRI",
      "VA_PERMATA",
      "QRIS",
      "GOPAY",
    ]);
    expect(codes).not.toContain("CREDIT_CARD");
  });
});

describe("methodMeta", () => {
  it("returns metadata for a known method", () => {
    expect(methodMeta("QRIS").name).toBe("QRIS");
    expect(methodMeta("VA_BCA").icon).toBe("BCA");
  });

  it("falls back for an unknown method (defensive)", () => {
    const meta = methodMeta("SOMETHING" as never);
    expect(meta.name).toBe("SOMETHING");
    expect(meta.icon).toBe("?");
  });
});
