import { fireEvent, render } from "@testing-library/react-native";

let mockMotionReduced = false;
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => mockMotionReduced };
});

// eslint-disable-next-line import/first
import {
  getUnderlineTransformOrigin,
  NavLink,
} from "../../../../../../presentation/components/Header/NavLink/index";

describe("NavLink", () => {
  afterEach(() => {
    mockMotionReduced = false;
  });

  it("supports press and animated hover transitions", () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = render(
      <NavLink label="Beranda" onPress={onPress} testID="nav-link" />,
    );
    const link = getByRole("button", { name: "Beranda event" });

    expect(getByText("Beranda")).toBeTruthy();
    fireEvent(link, "hoverIn");
    fireEvent(link, "hoverOut");
    fireEvent.press(link);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("sets the underline immediately with reduced motion", () => {
    mockMotionReduced = true;
    const { getByRole } = render(
      <NavLink label="Jelajahi" onPress={jest.fn()} />,
    );
    const link = getByRole("button", { name: "Jelajahi event" });

    fireEvent(link, "hoverIn");
    fireEvent(link, "hoverOut");

    expect(link).toBeTruthy();
  });

  it("anchors the underline to the side matching its progress", () => {
    expect(getUnderlineTransformOrigin(0)).toBe("right");
    expect(getUnderlineTransformOrigin(0.75)).toBe("left");
  });
});
