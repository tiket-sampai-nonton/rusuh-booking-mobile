import { render, screen } from "@testing-library/react-native";

const mockUseLocalSearchParams = jest.fn(
  (): { resourceId?: string; reason?: string; remainingMs?: string } => ({
    resourceId: "res-1",
    reason: "queue",
  }),
);

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
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

  it("normalizes missing and unsupported expiry parameters safely", () => {
    mockUseLocalSearchParams.mockReturnValue({
      resourceId: undefined,
      reason: "unknown",
      remainingMs: "0",
    });
    const unsupportedReason = ExpiredScreen();
    expect(unsupportedReason.props.resourceId).toBe("");
    expect(unsupportedReason.props.reason).toBeUndefined();
    expect(unsupportedReason.props.remainingMs).toBe(0);

    mockUseLocalSearchParams.mockReturnValue({
      resourceId: "res-2",
      reason: undefined,
      remainingMs: "",
    });
    const missingReason = ExpiredScreen();
    expect(missingReason.props.reason).toBeUndefined();
    expect(missingReason.props.remainingMs).toBeUndefined();
  });
});
