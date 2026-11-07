import { designColors } from "@presentation/theme";
import {
  socialLinkContainerColor,
  socialLinkTextColor,
} from "@presentation/screens/Home/fragments/HomeFooter/SocialLink/style";

describe("social link hover colors", () => {
  it("keeps defaults and flips colors after the hover threshold", () => {
    expect(socialLinkContainerColor(0, designColors.ground)).toBe(
      designColors.ground,
    );
    expect(socialLinkContainerColor(0.6, designColors.ground)).toBe(
      "transparent",
    );
    expect(socialLinkTextColor(0, designColors.ink, designColors.ground)).toBe(
      designColors.ground,
    );
    expect(
      socialLinkTextColor(0.6, designColors.ink, designColors.ground),
    ).toBe(designColors.ink);
  });
});
