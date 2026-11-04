import { render } from "@testing-library/react-native";

// Mock expo-router's Stack to a null-rendering stub so the layout's JSX actually
// executes under test (the real Stack needs a navigation container at runtime).
// useRouter is stubbed too: RBT-072's NotificationBridge (useNotifications)
// reads it. On the jest default platform the bridge registers via the mocked
// expo-notifications; here we only assert the layout mounts without crashing.
jest.mock("expo-router", () => ({
  Stack: () => null,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

// Mock expo-font's useFonts for V2 Inter font loading (RBT-096)
jest.mock("expo-font", () => ({
  useFonts: () => [true, null], // fonts loaded, no error
}));

// eslint-disable-next-line import/first
import RootLayout from "../../app/_layout";

describe("RootLayout (skeleton)", () => {
  it("renders the router root without crashing", () => {
    expect(() => render(<RootLayout />)).not.toThrow();
  });

  it("shows the native launch splash on the native test platform", () => {
    const { getByTestId } = render(<RootLayout />);
    expect(getByTestId("native-launch-splash")).toBeTruthy();
  });
});
