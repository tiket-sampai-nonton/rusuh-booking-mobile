import { render } from "@testing-library/react-native";

const mockRouterReplace = jest.fn();
const mockPathname = jest.fn(() => "/");
const mockRootNavigationState = jest.fn<{ key: string } | null, []>(() => ({
  key: "root",
}));
const mockUseRestoreMembership = jest.fn();
const mockUseRestoreBookingSession = jest.fn();

jest.mock("expo-router", () => ({
  usePathname: () => mockPathname(),
  useRootNavigationState: () => mockRootNavigationState(),
  useRouter: () => ({ replace: mockRouterReplace }),
}));
jest.mock("@presentation/hooks/useRestoreMembership", () => ({
  useRestoreMembership: (...args: unknown[]) =>
    mockUseRestoreMembership(...args),
}));
jest.mock("@presentation/hooks/useBookingSession", () => ({
  useRestoreBookingSession: (...args: unknown[]) =>
    mockUseRestoreBookingSession(...args),
}));

// eslint-disable-next-line import/first
import { QueueMembershipBridge } from "@presentation/bridges/QueueMembershipBridge";

describe("QueueMembershipBridge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue("/");
    mockRootNavigationState.mockReturnValue({ key: "root" });
    mockUseRestoreMembership.mockReturnValue({ resumed: null });
    mockUseRestoreBookingSession.mockReturnValue({
      session: null,
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });
  });

  it("restores a claimed membership into its active checkout session", () => {
    mockUseRestoreMembership.mockReturnValue({
      resumed: {
        membership: { eventId: "evt-1", queueId: "queue-1" },
        entry: { status: "CLAIMED" },
      },
    });
    mockUseRestoreBookingSession.mockReturnValue({
      session: { sessionId: "session-1" },
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });

    render(<QueueMembershipBridge />);

    expect(mockUseRestoreMembership).toHaveBeenCalledWith(true);
    expect(mockUseRestoreBookingSession).toHaveBeenCalledWith(
      true,
      undefined,
      "evt-1",
    );
    expect(mockRouterReplace).toHaveBeenCalledWith("/checkout/session-1");
  });

  it("does not override an explicit deep link or an unready router", () => {
    mockPathname.mockReturnValue("/events/evt-1");
    mockRootNavigationState.mockReturnValue(null);
    render(<QueueMembershipBridge />);
    expect(mockUseRestoreMembership).toHaveBeenCalledWith(false);
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
