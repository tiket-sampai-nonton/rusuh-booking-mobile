import {
  MAX_TICKETS,
  appendRow,
  attendeeNiksUnique,
  buyerNikUsedOnce,
  effectiveCap,
  isCheckoutReady,
  isQuantityValid,
  isValidEmail,
  isValidNik,
  maskNik,
  patchRowAt,
  removeRowAt,
  resolveAttendeeNiks,
  setBuyerUseAt,
  type TicketRow,
} from "@domain/rules/checkout";

const row = (over: Partial<TicketRow> = {}): TicketRow => ({
  categoryId: "REG",
  attendeeName: "A",
  attendeeNik: "3171010101010001",
  useBuyerNik: false,
  ...over,
});

describe("checkout quantity + category rules (RBT-051)", () => {
  it("effectiveCap never exceeds MAX_TICKETS (3)", () => {
    expect(effectiveCap(undefined)).toBe(MAX_TICKETS);
    expect(effectiveCap(2)).toBe(2);
    expect(effectiveCap(10)).toBe(MAX_TICKETS); // over-3 clamped
  });

  it("isQuantityValid enforces min 1 and max = min(maxSelectable, 3)", () => {
    expect(isQuantityValid(0, 3)).toBe(false); // below min
    expect(isQuantityValid(1, 3)).toBe(true);
    expect(isQuantityValid(3, 3)).toBe(true);
    expect(isQuantityValid(4, 3)).toBe(false); // over cap
    expect(isQuantityValid(3, 2)).toBe(false); // over maxSelectable
    expect(isQuantityValid(5, 10)).toBe(false); // over MAX_TICKETS even if maxSel high
  });
});

describe("single-use buyer NIK + uniqueness (RBT-051 item rules)", () => {
  it("buyerNikUsedOnce is false when two rows claim the buyer NIK", () => {
    expect(buyerNikUsedOnce([row({ useBuyerNik: true }), row({ useBuyerNik: true })])).toBe(false);
    expect(buyerNikUsedOnce([row({ useBuyerNik: true }), row()])).toBe(true);
    expect(buyerNikUsedOnce([row(), row()])).toBe(true);
  });

  it("resolveAttendeeNiks substitutes the buyer NIK on useBuyerNik rows", () => {
    const niks = resolveAttendeeNiks(
      [row({ useBuyerNik: true }), row({ attendeeNik: "3171010101010002" })],
      "3171999999999999",
    );
    expect(niks).toEqual(["3171999999999999", "3171010101010002"]);
  });

  it("attendeeNiksUnique rejects duplicate (resolved) NIKs", () => {
    const dup = [row({ attendeeNik: "3171010101010001" }), row({ attendeeNik: "3171010101010001" })];
    expect(attendeeNiksUnique(dup, "3171999999999999")).toBe(false);
    const uniq = [row({ attendeeNik: "3171010101010001" }), row({ attendeeNik: "3171010101010002" })];
    expect(attendeeNiksUnique(uniq, "3171999999999999")).toBe(true);
  });
});

describe("row-list transforms (RBT-051 add/remove/patch/single-use)", () => {
  it("appendRow adds under the cap and refuses at the cap", () => {
    const one = [row()];
    expect(appendRow(one, row({ categoryId: "VIP" }), 3)).toHaveLength(2);
    const atCap = [row(), row(), row()];
    expect(appendRow(atCap, row(), 3)).toHaveLength(3); // capped, unchanged length
    expect(appendRow(atCap, row(), 3)).not.toBe(atCap); // new array (no mutation)
  });

  it("removeRowAt drops the row but never below min 1", () => {
    const two = [row({ attendeeName: "A" }), row({ attendeeName: "B" })];
    expect(removeRowAt(two, 0)).toEqual([row({ attendeeName: "B" })]);
    const one = [row()];
    expect(removeRowAt(one, 0)).toHaveLength(1); // min-1 floor holds
    expect(removeRowAt(one, 0)).not.toBe(one); // copy
  });

  it("patchRowAt merges into only the targeted index", () => {
    const rows = [row({ attendeeName: "A" }), row({ attendeeName: "B" })];
    const out = patchRowAt(rows, 1, { attendeeName: "B2" });
    expect(out[0].attendeeName).toBe("A"); // untouched (i !== index arm)
    expect(out[1].attendeeName).toBe("B2"); // patched (i === index arm)
  });

  it("setBuyerUseAt is single-use: ON clears the others, OFF leaves them", () => {
    const rows = [row(), row()];
    const on0 = setBuyerUseAt(rows, 0, true);
    expect(on0[0].useBuyerNik).toBe(true);
    expect(on0[1].useBuyerNik).toBe(false);
    // Turning ON row 1 clears row 0 (single-use across rows).
    const on1 = setBuyerUseAt(on0, 1, true);
    expect(on1[0].useBuyerNik).toBe(false);
    expect(on1[1].useBuyerNik).toBe(true);
    // Turning OFF row 1 leaves the (already off) others as-is.
    const off1 = setBuyerUseAt(on1, 1, false);
    expect(off1[0].useBuyerNik).toBe(false);
    expect(off1[1].useBuyerNik).toBe(false);
  });
});

describe("validators + mask", () => {
  it("isValidNik requires exactly 16 digits", () => {
    expect(isValidNik("3171010101010001")).toBe(true);
    expect(isValidNik("317101010101000")).toBe(false); // 15
    expect(isValidNik("31710101010100011")).toBe(false); // 17
    expect(isValidNik("3171-0101-0101-0001")).toBe(false); // non-digit
  });
  it("isValidEmail is a minimal UX gate", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("nope")).toBe(false);
  });
  it("maskNik shows first2+last2 only, never the raw middle", () => {
    expect(maskNik("3171010101010001")).toBe("31****01");
    expect(maskNik("abc")).toBe("****"); // too short
  });
});

describe("isCheckoutReady end-to-end", () => {
  const base = {
    buyerNik: "3171999999999999",
    buyerEmail: "buyer@mail.com",
    maxSelectable: 3,
  };
  it("is true for a valid single-row order", () => {
    expect(isCheckoutReady({ ...base, rows: [row()] })).toBe(true);
  });
  it("is false with an invalid buyer NIK or email", () => {
    expect(isCheckoutReady({ ...base, buyerNik: "123", rows: [row()] })).toBe(false);
    expect(isCheckoutReady({ ...base, buyerEmail: "x", rows: [row()] })).toBe(false);
  });
  it("is false when over the cap, duplicate NIK, or incomplete row", () => {
    expect(isCheckoutReady({ ...base, rows: [row(), row(), row(), row()] })).toBe(false); // >3
    expect(
      isCheckoutReady({ ...base, rows: [row({ attendeeName: "" })] }),
    ).toBe(false); // empty name
    expect(
      isCheckoutReady({ ...base, rows: [row({ attendeeNik: "123" })] }),
    ).toBe(false); // bad attendee nik
  });
  it("accepts a useBuyerNik row (buyer attends) with a valid buyer NIK", () => {
    expect(
      isCheckoutReady({ ...base, rows: [row({ useBuyerNik: true, attendeeName: "", attendeeNik: "" })] }),
    ).toBe(true);
  });
  it("rejects two rows both claiming the buyer NIK", () => {
    expect(
      isCheckoutReady({
        ...base,
        rows: [row({ useBuyerNik: true }), row({ useBuyerNik: true })],
      }),
    ).toBe(false);
  });
});
