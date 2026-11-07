import { render, screen } from "@testing-library/react-native";

const mockUseLocalSearchParams = jest.fn(
  (): { resourceId?: string; reason?: string; remainingMs?: string } => ({
    resourceId: "res-1",
    reason: "queue",
  }),
);
const mockRedirect = jest.fn((_props: { href: string }) => null);

jest.mock("expo-router", () => ({
  Redirect: (props: { href: string }) => mockRedirect(props),
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

// eslint-disable-next-line import/first
import ExpiredScreen from "../../app/expired/[resourceId]";

describe("/expired/[resourceId] route", () => {
  it("exports a component function", () => {
    expect(typeof ExpiredScreen).toBe("function");
  });

  it("redirects legacy expired links to the failed route", () => {
    render(<ExpiredScreen />);
    expect(mockRedirect).toHaveBeenCalledWith({
      href: "/failed/res-1?reason=queue",
    });
  });

  it("normalizes missing and unsupported expiry parameters safely", () => {
    mockUseLocalSearchParams.mockReturnValue({
      resourceId: undefined,
      reason: "unknown",
      remainingMs: "0",
    });
    const unsupportedReason = ExpiredScreen();
    expect(unsupportedReason.props.children[1].props.href).toBe(
      "/failed/?reason=unknown&remainingMs=0",
    );

    mockUseLocalSearchParams.mockReturnValue({
      resourceId: "res-2",
      reason: undefined,
      remainingMs: "",
    });
    const missingReason = ExpiredScreen();
    expect(missingReason.props.children[1].props.href).toBe("/failed/res-2");
  });
});
