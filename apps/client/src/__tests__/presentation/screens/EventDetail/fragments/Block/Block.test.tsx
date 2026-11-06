import { act, render, screen } from "@testing-library/react-native";
import { Animated, Platform, Text } from "react-native";

import { Block } from "../../../../../../presentation/screens/EventDetail/fragments/Block/index";

describe("Event detail Block", () => {
  const originalPlatform = Platform.OS;
  const completedAnimation = {
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(Animated, "timing").mockReturnValue(completedAnimation as never);
    jest
      .spyOn(Animated, "parallel")
      .mockReturnValue(completedAnimation as never);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
  });

  it("renders a titled section and runs its reveal after the delay", () => {
    render(
      <Block label="Tentang Event" heading="Tentang">
        <Text>Informasi acara</Text>
      </Block>,
    );
    expect(screen.getByRole("header", { name: "Tentang Event" })).toBeTruthy();
    expect(screen.getByText("Informasi acara")).toBeTruthy();
    act(() => jest.advanceTimersByTime(100));
    expect(Animated.parallel).toHaveBeenCalledTimes(1);
  });
});
