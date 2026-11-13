import { render, waitFor } from "@testing-library/react-native";
import { DomainError } from "@domain/errors/domain-error";

const mockRouterReplace = jest.fn();
const mockPathname = jest.fn(() => "/");
const mockRootNavigationState = jest.fn<{ key: string } | null, []>(() => ({
  key: "root",
}));
const mockUseRestoreMembership = jest.fn();
const mockUseRestoreBookingSession = jest.fn();
const mockLoadPayment = jest.fn();
const mockClearQueue = jest.fn();
const mockPaymentStorage = { load: mockLoadPayment };

jest.mock("@providers/service-context", () => ({
  useServices: () => ({ paymentJourneyStorage: mockPaymentStorage }),
}));

jest.mock("expo-router", () => ({
  usePathname: () => mockPathname(),
  useRootNavigationState: () => mockRootNavigationState(),
  useRouter: () => ({ replace: mockRouterReplace }),
}));
jest.mock("@presentation/hooks/useRestoreMembership", () => ({
  useClearQueueMembership: () => mockClearQueue,
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
    mockLoadPayment.mockResolvedValue(null);
    mockClearQueue.mockResolvedValue(undefined);
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

  it("restores a claimed membership into its active checkout session", async () => {
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

    await waitFor(() =>
      expect(mockUseRestoreMembership).toHaveBeenCalledWith(true),
    );
    expect(mockUseRestoreBookingSession).toHaveBeenCalledWith(
      true,
      undefined,
      "evt-1",
    );
    expect(mockRouterReplace).toHaveBeenCalledWith("/checkout/session-1");
  });

  it("does not restore checkout when a payment journey exists", async () => {
    mockLoadPayment.mockResolvedValue({ bookingId: "booking-1" });
    mockUseRestoreMembership.mockReturnValue({
      resumed: {
        membership: { eventId: "evt-1", queueId: "queue-1" },
        entry: { status: "CLAIMED" },
      },
    });
    render(<QueueMembershipBridge />);
    await waitFor(() => expect(mockLoadPayment).toHaveBeenCalled());
    expect(mockRouterReplace).not.toHaveBeenCalled();
    expect(mockUseRestoreMembership).not.toHaveBeenCalledWith(true);
  });

  it("clears a claimed queue when the server confirms there is no active checkout", async () => {
    mockUseRestoreMembership.mockReturnValue({
      resumed: {
        membership: { eventId: "evt-1", queueId: "queue-1" },
        entry: { status: "CLAIMED" },
      },
    });
    render(<QueueMembershipBridge />);
    await waitFor(() => expect(mockClearQueue).toHaveBeenCalled());
    await waitFor(() => expect(mockRouterReplace).toHaveBeenCalledWith("/"));
  });

  it("clears a claimed queue and returns home when the BE confirms checkout expiry", async () => {
    mockUseRestoreMembership.mockReturnValue({
      resumed: {
        membership: { eventId: "evt-1", queueId: "queue-1" },
        entry: { status: "CLAIMED" },
      },
    });
    mockUseRestoreBookingSession.mockReturnValue({
      session: undefined,
      isLoading: false,
      error: new DomainError({
        kind: "session_expired",
        code: "SESSION_EXPIRED",
        userMessage: "Session expired",
      }),
      retry: jest.fn(),
    });

    render(<QueueMembershipBridge />);

    await waitFor(() => expect(mockClearQueue).toHaveBeenCalled());
    await waitFor(() => expect(mockRouterReplace).toHaveBeenCalledWith("/"));
  });

  it("does not override an explicit deep link or an unready router", () => {
    mockPathname.mockReturnValue("/events/evt-1");
    mockRootNavigationState.mockReturnValue(null);
    render(<QueueMembershipBridge />);
    expect(mockUseRestoreMembership).toHaveBeenCalledWith(false);
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
