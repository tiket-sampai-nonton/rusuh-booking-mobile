import { render } from "@testing-library/react-native";

// Mock expo-router's Stack to a null-rendering stub so the layout's JSX actually
// executes under test (the real Stack needs a navigation container at runtime).
jest.mock("expo-router", () => ({
  Stack: () => null,
}));

// eslint-disable-next-line import/first
import RootLayout from "../../app/_layout";

describe("RootLayout (skeleton)", () => {
  it("renders the router root without crashing", () => {
    expect(() => render(<RootLayout />)).not.toThrow();
  });
});
