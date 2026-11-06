jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  __esModule: true,
  default: {
    OS: "web",
    select: (options: Record<string, unknown>) => options.web ?? options.default,
  },
}));

// eslint-disable-next-line import/first -- Platform must be mocked before styles are evaluated.
import { Platform } from "react-native";

// eslint-disable-next-line import/first -- Platform must be mocked before styles are evaluated.
import { componentStyles, styleForFilterModalPressable0, styleForFilterModalView1 } from "@presentation/components/FilterModal/style";

describe("FilterModal style variants", () => {
  it("uses the centered web backdrop and bottom-safe sheet spacing", () => {
    expect(Platform.OS).toBe("web");
    expect(componentStyles.elementFlex0.justifyContent).toBe("center");
    expect(styleForFilterModalPressable0({ top: 0, right: 0, bottom: 30, left: 0 })).toMatchObject({
      paddingBottom: 24,
      maxWidth: 480,
    });
    expect(styleForFilterModalView1()).toMatchObject({ zIndex: 10000, elevation: 10000 });
  });
});
