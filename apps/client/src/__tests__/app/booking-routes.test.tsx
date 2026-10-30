import { render, screen } from "@testing-library/react-native";

jest.mock("expo-router", () => ({
  Stack: () => null,
  useLocalSearchParams: () => ({
    eventId: "evt-1",
    sessionId: "sess-1",
    bookingId: "bk-1",
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

  it("renders Waiting with the event param", () => {
    render(<WaitingScreen />);
    expect(screen.getByRole("header")).toHaveTextContent(/evt-1/);
  });

  it("renders Checkout with the session param", () => {
    render(<CheckoutScreen />);
    expect(screen.getByRole("header")).toHaveTextContent(/sess-1/);
  });

  it("renders Payment with the booking param", () => {
    render(<PaymentScreen />);
    expect(screen.getByRole("header")).toHaveTextContent(/bk-1/);
  });

  it("renders Success with the booking param", () => {
    render(<SuccessScreen />);
    expect(screen.getByRole("header")).toHaveTextContent(/bk-1/);
  });
});
