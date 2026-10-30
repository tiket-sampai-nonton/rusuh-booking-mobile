import { render, screen } from "@testing-library/react-native";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ resourceId: "res-1", reason: "session" }),
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

// eslint-disable-next-line import/first
import ExpiredRoute from "../../app/expired/[resourceId]";

describe("/expired/[resourceId] route shell", () => {
  it("exports a component function", () => {
    expect(typeof ExpiredRoute).toBe("function");
  });

  it("mounts the ExpiredScreen with the route params", () => {
    render(<ExpiredRoute />);
    expect(screen.getByTestId("expired-screen")).toBeTruthy();
  });
});
