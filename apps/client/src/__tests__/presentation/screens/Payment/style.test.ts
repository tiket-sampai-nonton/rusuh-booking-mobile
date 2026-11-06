import {
  paymentBar,
  paymentScrollContent,
  paymentTopBar,
} from "@presentation/screens/Payment/style";

describe("Payment style variants", () => {
  it("adds the safe-area top and bottom insets", () => {
    expect(paymentTopBar(20)).toEqual({ paddingTop: 30 });
    expect(paymentBar(12).paddingBottom).toBe(28);
  });

  it("caps desktop content and leaves mobile content fluid", () => {
    expect(paymentScrollContent(false).maxWidth).toBeUndefined();
    expect(paymentScrollContent(true)).toMatchObject({
      maxWidth: 620,
      width: "100%",
      alignSelf: "center",
    });
  });
});
