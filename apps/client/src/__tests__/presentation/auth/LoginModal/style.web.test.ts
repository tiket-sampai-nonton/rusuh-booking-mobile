jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "web",
  select: (options: Record<string, unknown>) => options.web ?? options.default,
}));

// eslint-disable-next-line import/first -- Platform must be mocked before styles are evaluated.
import { loginStyles } from "@presentation/components/auth/LoginModal/style";

describe("web login modal overlay style", () => {
  it("applies the web backdrop blur", () => {
    expect(loginStyles.overlay).toMatchObject({ backdropFilter: "blur(4px)" });
  });
});
