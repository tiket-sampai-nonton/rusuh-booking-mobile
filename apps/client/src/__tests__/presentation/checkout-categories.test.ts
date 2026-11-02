import {
  CATEGORIES,
  categoryPrice,
  emptyRow,
} from "@presentation/screens/Checkout/categories";
import {
  checkoutScrollContent,
  checkoutTopBar,
} from "@presentation/screens/Checkout/style";

describe("Checkout style helpers (RBT-051)", () => {
  it("scroll content adds a desktop max-width container", () => {
    const desktop = checkoutScrollContent(true) as Record<string, unknown>;
    expect(desktop.maxWidth).toBe(760);
    expect(desktop.alignSelf).toBe("center");
  });

  it("scroll content stays full-width on mobile (no max-width)", () => {
    const mobile = checkoutScrollContent(false) as Record<string, unknown>;
    expect(mobile.maxWidth).toBeUndefined();
    expect(mobile.paddingBottom).toBe(120);
  });

  it("topbar padding adds the safe-area inset", () => {
    expect(checkoutTopBar(10).paddingTop).toBe(20);
  });
});

describe("Checkout categories (RBT-051)", () => {
  it("categoryPrice returns the per-category mock price (O2 gap)", () => {
    expect(categoryPrice("REG")).toBe(45000000);
    expect(categoryPrice("VIP")).toBe(95000000);
  });

  it("categoryPrice falls back to 0 for an unknown category", () => {
    expect(categoryPrice("NOPE")).toBe(0);
  });

  it("emptyRow seeds the first category, blank attendee, buyer-nik off", () => {
    const row = emptyRow();
    expect(row.categoryId).toBe(CATEGORIES[0].id);
    expect(row.attendeeName).toBe("");
    expect(row.attendeeNik).toBe("");
    expect(row.useBuyerNik).toBe(false);
  });
});
