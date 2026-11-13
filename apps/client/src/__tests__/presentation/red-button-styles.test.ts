import { designColors } from "@presentation/theme";
import { hardShadowStyle } from "@presentation/utils/style";
import { styleForButtonPressable0 } from "@presentation/components/Button/style";
import { styleForPaymentBarPressable1 } from "@presentation/screens/Payment/fragments/PaymentBar/style";
import { styles as checkoutBar } from "@presentation/screens/Checkout/fragments/CheckoutBar/style";

describe("red button styling", () => {
  it("uses the ink border on shared, checkout, and payment actions", () => {
    const button = styleForButtonPressable0(
      {
        bg: designColors.accent,
        fg: designColors.ground,
        fill: designColors.accent,
        filledFg: designColors.ground,
      },
      10,
      20,
      false,
    );
    expect(button.borderColor).toBe(designColors.ink);
    expect(checkoutBar.payButton.borderColor).toBe(designColors.ink);
    expect(styleForPaymentBarPressable1(true).borderColor).toBe(
      designColors.ink,
    );
  });

  it.each(["ios", "android"] as const)(
    "uses a black native shadow on %s",
    (platform) => {
      expect(
        hardShadowStyle(4, 4, designColors.ink, 4, platform),
      ).toMatchObject({ shadowColor: designColors.ink, elevation: 4 });
    },
  );

  it("uses a black web shadow", () => {
    expect(hardShadowStyle(4, 4, designColors.ink, 4, "web")).toHaveProperty(
      "boxShadow",
      `4px 4px 0 ${designColors.ink}`,
    );
  });
});
