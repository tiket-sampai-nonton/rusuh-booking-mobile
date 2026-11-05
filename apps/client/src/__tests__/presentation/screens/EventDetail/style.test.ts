jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "web",
  select: (options: Record<string, unknown>) => options.web ?? options.default,
}));

// eslint-disable-next-line import/first -- Platform must be mocked before styles are evaluated.
import { Platform } from "react-native";

// eslint-disable-next-line import/first -- Platform must be mocked before styles are evaluated.
import {
  designDetailScrollContent,
  designDetailStyles,
  detailCta,
  detailScrollContent,
  FLOATING_CTA_HEIGHT,
  HEADER_HEIGHT,
  HERO_HEIGHT,
  SAFE_AREA_BOTTOM,
} from "@presentation/screens/EventDetail/style";
// eslint-disable-next-line import/first -- Platform must be mocked before styles are evaluated.
import { heroStyles } from "@presentation/screens/EventDetail/fragments/DetailHero/style";

describe("EventDetail web style variant", () => {
  it("resolves web-specific dimensions and style branches", () => {
    expect(Platform.OS).toBe("web");
    expect(HERO_HEIGHT).toBe(400);
    expect(HEADER_HEIGHT).toBe(60);
    expect(SAFE_AREA_BOTTOM).toBe(0);
    expect(FLOATING_CTA_HEIGHT).toBeGreaterThan(0);
    expect(designDetailStyles.header.backgroundColor).toBeTruthy();
    expect(heroStyles.overlayWeb.backgroundImage).toContain("linear-gradient");
  });

  it("returns enabled and disabled CTA styles and scroll content", () => {
    expect(detailCta(false)).toHaveLength(2);
    expect(detailCta(true)[1]).toBeTruthy();
    expect(designDetailScrollContent(true)).toHaveProperty("paddingBottom");
    expect(detailScrollContent(false)).toHaveProperty("paddingBottom");
  });
});
