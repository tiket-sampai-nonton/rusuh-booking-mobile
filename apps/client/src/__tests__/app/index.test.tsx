import { render, screen } from "@testing-library/react-native";

import HomeScreen from "../../app/index";

// Smoke test: the skeleton home renders the app name header.
// Proves jest-expo + RNTL + NativeWind className handling + alias resolution.
describe("HomeScreen (skeleton)", () => {
  it("renders the app name header", () => {
    render(<HomeScreen />);
    expect(screen.getByRole("header")).toHaveTextContent("Rusuh Booking");
  });
});
