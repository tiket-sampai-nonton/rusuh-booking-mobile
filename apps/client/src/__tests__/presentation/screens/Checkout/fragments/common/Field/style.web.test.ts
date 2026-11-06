jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  __esModule: true,
  default: {
    OS: "web",
    select: (options: Record<string, unknown>) => options.web ?? options.default,
  },
}));

// eslint-disable-next-line import/first -- Platform must be mocked before styles are evaluated.
import { fieldFocusStyle } from "@presentation/screens/Checkout/fragments/common/Field/style";

describe("checkout field web focus style", () => {
  it("uses the web shadow and transform when focused", () => {
    expect(fieldFocusStyle(true)).toMatchObject({ boxShadow: "4px 4px 0 #000" });
    expect(fieldFocusStyle(false)).toEqual({});
  });
});
