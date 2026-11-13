import { fireEvent, render } from "@testing-library/react-native";
import { Platform } from "react-native";

let mockReducedMotion = false;
jest.mock("react-native-reanimated", () => ({
  ...jest.requireActual("react-native-reanimated/mock"),
  useReducedMotion: () => mockReducedMotion,
}));

// eslint-disable-next-line import/first
import { IconButton } from "@presentation/components/Header/IconButton";

describe("Header IconButton platform and motion states", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    mockReducedMotion = false;
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
  });

  it("uses native elevation and animated press feedback", () => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <IconButton icon="login" label="Masuk" onPress={onPress} />,
    );
    const button = getByLabelText("Masuk");
    fireEvent(button, "pressIn");
    fireEvent.press(button);
    fireEvent(button, "pressOut");
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("uses web shadow and immediate feedback for reduced motion", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    mockReducedMotion = true;
    const { getByLabelText } = render(
      <IconButton icon="login" label="Masuk" />,
    );
    const button = getByLabelText("Masuk");
    fireEvent(button, "pressIn");
    fireEvent(button, "pressOut");
    expect(button).toBeTruthy();
  });
});
