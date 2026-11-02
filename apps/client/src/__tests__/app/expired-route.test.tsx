import { render, screen } from "@testing-library/react-native";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ resourceId: "res-1", reason: "queue" }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

// eslint-disable-next-line import/first
import ExpiredScreen from "../../app/expired/[resourceId]";

describe("/expired/[resourceId] route", () => {
  it("exports a component function", () => {
    expect(typeof ExpiredScreen).toBe("function");
  });

  it("renders the recovery screen (RBT-064) for the resource", () => {
    render(<ExpiredScreen />);
    // the recovery screen mounts with a header + a re-queue action
    expect(screen.getByTestId("expired-recovery")).toBeTruthy();
    expect(screen.getByRole("header")).toBeTruthy();
    expect(screen.getByTestId("expired-requeue")).toBeTruthy();
  });
});
