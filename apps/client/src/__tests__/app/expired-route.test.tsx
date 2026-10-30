import { render, screen } from "@testing-library/react-native";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ resourceId: "res-1" }),
}));

// eslint-disable-next-line import/first
import ExpiredScreen from "../../app/expired/[resourceId]";

describe("/expired/[resourceId] route", () => {
  it("exports a component function", () => {
    expect(typeof ExpiredScreen).toBe("function");
  });

  it("renders Expired with the resource param", () => {
    render(<ExpiredScreen />);
    expect(screen.getByRole("header")).toHaveTextContent(/res-1/);
  });
});
