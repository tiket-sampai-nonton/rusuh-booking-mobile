import { render, waitFor } from "@testing-library/react-native";

const mockReplace = jest.fn();
const mockLoad = jest.fn();
const mockPathname = jest.fn(() => "/");

jest.mock("expo-router", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ replace: mockReplace }),
}));
jest.mock("@providers/service-context", () => ({
  useServices: () => ({ paymentJourneyStorage: { load: mockLoad } }),
}));

// eslint-disable-next-line import/first
import { PaymentJourneyRecoveryBridge } from "@presentation/bridges/PaymentJourneyRecoveryBridge";

describe("PaymentJourneyRecoveryBridge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoad.mockResolvedValue(null);
    mockPathname.mockReturnValue("/");
  });

  it("restores the booking and event references without persisting guest identity", async () => {
    mockLoad.mockResolvedValue({ bookingId: "booking-1", eventId: "event-1" });

    render(<PaymentJourneyRecoveryBridge />);

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith(
        "/payment/booking-1?eventId=event-1",
      ),
    );
  });

  it("continues to restore legacy booking-only references", async () => {
    mockLoad.mockResolvedValue({ bookingId: "booking-legacy" });

    render(<PaymentJourneyRecoveryBridge />);

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith("/payment/booking-legacy"),
    );
  });
});
