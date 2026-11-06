import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

let mockReducedMotion = false;
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => mockReducedMotion };
});

// eslint-disable-next-line import/first
import { ScreenFade } from "../../../../presentation/components/ScreenFade/index";

describe("ScreenFade", () => {
  afterEach(() => {
    mockReducedMotion = false;
  });

  it("wraps its screen content in the standard entrance transition", () => {
    render(
      <ScreenFade>
        <Text>Screen body</Text>
      </ScreenFade>,
    );
    expect(screen.getByText("Screen body")).toBeTruthy();
  });

  it("renders immediately when reduced motion is enabled", () => {
    mockReducedMotion = true;
    render(
      <ScreenFade>
        <Text>Reduced motion body</Text>
      </ScreenFade>,
    );
    expect(screen.getByText("Reduced motion body")).toBeTruthy();
  });
});
