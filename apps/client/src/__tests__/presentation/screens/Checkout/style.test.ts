import type { TicketRow } from "@domain/rules/checkout";
import {
  addTicketButtonStyle,
  checkoutBar,
  checkoutGrid,
  checkoutScrollContent,
  checkoutSidebar,
  checkoutTopBar,
} from "@presentation/screens/Checkout/style";

const row: TicketRow = {
  rowId: "row-1",
  categoryId: "REG",
  attendeeName: "",
  attendeeNik: "",
  useBuyerNik: false,
};

describe("Checkout style variants", () => {
  it("computes mobile and desktop containers", () => {
    expect(checkoutScrollContent(false).maxWidth).toBeUndefined();
    expect(checkoutScrollContent(true)).toMatchObject({ maxWidth: 800, width: "100%", alignSelf: "center" });
    expect(checkoutGrid(false)).toEqual({});
    expect(checkoutGrid(true)).toMatchObject({ flexDirection: "row", gap: 48 });
    expect(checkoutSidebar(false).width).toBe("100%");
    expect(checkoutSidebar(true)).toMatchObject({ width: 400, position: "sticky", top: 128 });
  });

  it("adds safe-area offsets and selects the ticket-cap presentation", () => {
    expect(checkoutTopBar(24)).toEqual({ paddingTop: 34 });
    expect(checkoutBar(20).paddingBottom).toBe(36);
    expect(addTicketButtonStyle([row], 1).opacity).toBe(0.4);
    expect(addTicketButtonStyle([], 1).opacity).toBe(1);
  });
});
