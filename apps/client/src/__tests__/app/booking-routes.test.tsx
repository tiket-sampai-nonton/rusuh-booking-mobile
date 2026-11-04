import { render, screen } from "@testing-library/react-native";

jest.mock("expo-router", () => ({
  Stack: () => null,
  useRouter: () => ({ replace: jest.fn() }),
  useLocalSearchParams: () => ({
    eventId: "evt-1",
    sessionId: "sess-1",
    bookingId: "bk-1",
  }),
}));

// The waiting route composes the RBT-043 screen, which consumes the queue hooks.
// Mock the seams so the routing-only smoke test needs no providers.
jest.mock("@presentation/hooks/useQueuePolling", () => ({
  useQueuePolling: () => ({
    entry: undefined,
    isLoading: false,
    isError: false,
    error: null,
    isSettled: false,
    leave: jest.fn(),
  }),
}));
jest.mock("@presentation/hooks/useAutoClaim", () => ({
  useAutoClaim: () => ({
    claiming: false,
    claimedSessionId: undefined,
    error: null,
    errorState: null,
  }),
}));

// eslint-disable-next-line import/first
import BookingLayout from "../../app/(booking)/_layout";
// eslint-disable-next-line import/first
import WaitingScreen from "../../app/(booking)/waiting/[eventId]";
// eslint-disable-next-line import/first
import CheckoutScreen from "../../app/(booking)/checkout/[sessionId]";
// eslint-disable-next-line import/first
import PaymentScreen from "../../app/(booking)/payment/[bookingId]";
// eslint-disable-next-line import/first
import SuccessScreen from "../../app/(booking)/success/[bookingId]";

describe("(booking) routes", () => {
  it("export component functions", () => {
    expect(typeof BookingLayout).toBe("function");
    expect(typeof WaitingScreen).toBe("function");
    expect(typeof CheckoutScreen).toBe("function");
    expect(typeof PaymentScreen).toBe("function");
    expect(typeof SuccessScreen).toBe("function");
  });

  it("renders the booking layout without crashing", () => {
    expect(() => render(<BookingLayout />)).not.toThrow();
  });

  it("renders the Waiting room (no-queue guard without a queueId)", () => {
    render(<WaitingScreen />);
    // V2 uses the localized no-queue message.
    expect(screen.getByTestId("waiting-noqueue")).toHaveTextContent(
      "Tidak Ada Antrean Aktif",
      { exact: false },
    );
  });

  it("exports the Checkout route as a component", () => {
    // RBT-051: /checkout is now a real screen (ServiceProvider + QueryClient
    // required) — its behavior is covered in CheckoutScreen.test.tsx. Here we
    // only assert the route module exports a renderable component.
    expect(typeof CheckoutScreen).toBe("function");
  });

  it("exports the Payment route as a component", () => {
    // RBT-060: /payment is now a real screen (ServiceProvider + QueryClient
    // required) — its behavior is covered in PaymentScreen.test.tsx. Here we
    // only assert the route module exports a renderable component.
    expect(typeof PaymentScreen).toBe("function");
  });

  it("exports the Success route as a component", () => {
    // RBT-070: /success is now a real screen (ServiceProvider + QueryClient
    // required) — its behavior is covered in SuccessScreen.test.tsx. Here we
    // only assert the route module exports a renderable component.
    expect(typeof SuccessScreen).toBe("function");
  });
});
