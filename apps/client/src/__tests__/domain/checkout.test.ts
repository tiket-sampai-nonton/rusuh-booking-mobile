import {
  attendeeNiksUnique,
  buyerNikUsedOnce,
  effectiveCap,
  isCheckoutReady,
  isQuantityValid,
  isValidEmail,
  isValidNik,
  maskNik,
  resolveAttendeeNiks,
  type TicketRow,
} from "@domain/rules/checkout";

const NIK_A = "3201010101010001";
const NIK_B = "3201010101010002";
const BUYER = "3201019999999999";

function row(p: Partial<TicketRow> = {}): TicketRow {
  return { categoryId: "REG", attendeeName: "A", attendeeNik: NIK_A, useBuyerNik: false, ...p };
}

describe("maskNik", () => {
  it("masks the middle, keeps first/last 2", () => {
    expect(maskNik(NIK_A)).toBe("32****01");
  });
  it("returns **** for a too-short value", () => {
    expect(maskNik("12")).toBe("****");
  });
});

describe("isValidNik", () => {
  it("accepts exactly 16 digits", () => {
    expect(isValidNik(NIK_A)).toBe(true);
  });
  it("rejects wrong length or non-digits", () => {
    expect(isValidNik("123")).toBe(false);
    expect(isValidNik("3201010101010001x")).toBe(false);
    expect(isValidNik("32010101010100012")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts a basic email and rejects junk", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail(" a@b.co ")).toBe(true);
    expect(isValidEmail("nope")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });
});

describe("isQuantityValid / effectiveCap", () => {
  it("bounds [1, min(maxSelectable,3)]", () => {
    expect(isQuantityValid(1, 3)).toBe(true);
    expect(isQuantityValid(3, 3)).toBe(true);
    expect(isQuantityValid(0, 3)).toBe(false);
    expect(isQuantityValid(4, 5)).toBe(false); // cap is 3
  });
  it("effectiveCap never exceeds 3 and defaults to 3", () => {
    expect(effectiveCap(5)).toBe(3);
    expect(effectiveCap(2)).toBe(2);
    expect(effectiveCap(undefined)).toBe(3);
  });
});

describe("resolveAttendeeNiks / buyerNikUsedOnce / attendeeNiksUnique", () => {
  it("resolves a useBuyerNik row to the buyer NIK", () => {
    const rows = [row({ useBuyerNik: true }), row({ attendeeNik: NIK_B })];
    expect(resolveAttendeeNiks(rows, BUYER)).toEqual([BUYER, NIK_B]);
  });
  it("buyerNikUsedOnce is false when two rows claim the buyer NIK", () => {
    expect(buyerNikUsedOnce([row({ useBuyerNik: true }), row({ useBuyerNik: true })])).toBe(false);
    expect(buyerNikUsedOnce([row({ useBuyerNik: true }), row()])).toBe(true);
  });
  it("attendeeNiksUnique detects a duplicate", () => {
    expect(attendeeNiksUnique([row({ attendeeNik: NIK_A }), row({ attendeeNik: NIK_A })], BUYER)).toBe(false);
    expect(attendeeNiksUnique([row({ attendeeNik: NIK_A }), row({ attendeeNik: NIK_B })], BUYER)).toBe(true);
  });
});

describe("isCheckoutReady", () => {
  const good = {
    buyerNik: BUYER,
    buyerEmail: "a@b.co",
    rows: [row({ attendeeNik: NIK_A })],
    maxSelectable: 3,
  };

  it("passes a fully-valid checkout", () => {
    expect(isCheckoutReady(good)).toBe(true);
  });
  it("passes when a single row uses the buyer NIK", () => {
    expect(
      isCheckoutReady({ ...good, rows: [row({ useBuyerNik: true, attendeeName: "", attendeeNik: "" })] }),
    ).toBe(true);
  });
  it("fails on invalid buyer NIK", () => {
    expect(isCheckoutReady({ ...good, buyerNik: "123" })).toBe(false);
  });
  it("fails on invalid email", () => {
    expect(isCheckoutReady({ ...good, buyerEmail: "nope" })).toBe(false);
  });
  it("fails on too many rows (over cap)", () => {
    expect(isCheckoutReady({ ...good, rows: [row(), row(), row(), row()] })).toBe(false);
  });
  it("fails when the buyer NIK is used on two rows", () => {
    expect(
      isCheckoutReady({ ...good, rows: [row({ useBuyerNik: true }), row({ useBuyerNik: true })] }),
    ).toBe(false);
  });
  it("fails on an empty category", () => {
    expect(isCheckoutReady({ ...good, rows: [row({ categoryId: "" })] })).toBe(false);
  });
  it("fails on an invalid attendee NIK", () => {
    expect(isCheckoutReady({ ...good, rows: [row({ attendeeNik: "123" })] })).toBe(false);
  });
  it("fails on an empty attendee name", () => {
    expect(isCheckoutReady({ ...good, rows: [row({ attendeeName: "  " })] })).toBe(false);
  });
  it("fails on duplicate attendee NIKs", () => {
    expect(
      isCheckoutReady({ ...good, rows: [row({ attendeeNik: NIK_A }), row({ attendeeNik: NIK_A })] }),
    ).toBe(false);
  });
});
