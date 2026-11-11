import {
  categoryPrice,
  emptyRow,
} from "@presentation/screens/Checkout/categories";
import { BOOKING_CATEGORY_FIXTURE } from "@shared/test-fixtures/booking-categories.fixture";
import {
  checkoutScrollContent,
  checkoutTopBar,
} from "@presentation/screens/Checkout/style";

describe("Checkout style helpers (RBT-051)", () => {
  it("scroll content adds a desktop max-width container", () => {
    const desktop = checkoutScrollContent(true) as Record<string, unknown>;
    //  uses 800px max-width (was 760 in V1)
    expect(desktop.maxWidth).toBe(800);
    expect(desktop.alignSelf).toBe("center");
  });

  it("scroll content stays full-width on mobile (no max-width)", () => {
    const mobile = checkoutScrollContent(false) as Record<string, unknown>;
    expect(mobile.maxWidth).toBeUndefined();
    //  uses 140px paddingBottom for sticky bar (was 120 in V1)
    expect(mobile.paddingBottom).toBe(140);
  });

  it("topbar padding adds the safe-area inset", () => {
    expect(checkoutTopBar(10).paddingTop).toBe(20);
  });
});

describe("Checkout categories (RBT-051)", () => {
  it("categoryPrice resolves prices by the contract category ID", () => {
    expect(
      categoryPrice(
        BOOKING_CATEGORY_FIXTURE[0].categoryId,
        BOOKING_CATEGORY_FIXTURE,
      ),
    ).toBe(450000);
    expect(
      categoryPrice(
        BOOKING_CATEGORY_FIXTURE[1].categoryId,
        BOOKING_CATEGORY_FIXTURE,
      ),
    ).toBe(950000);
  });

  it("categoryPrice falls back to 0 for an unknown category", () => {
    expect(categoryPrice("NOPE", BOOKING_CATEGORY_FIXTURE)).toBe(0);
  });

  it("emptyRow uses its supplied category and leaves attendee data blank", () => {
    const row = emptyRow(BOOKING_CATEGORY_FIXTURE[0].categoryId);
    expect(row.categoryId).toBe(BOOKING_CATEGORY_FIXTURE[0].categoryId);
    expect(row.attendeeName).toBe("");
    expect(row.attendeeNik).toBe("");
    expect(row.useBuyerNik).toBe(false);
  });
});
