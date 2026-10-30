import { screen } from "@testing-library/react-native";

import { useSessionStore } from "@presentation/stores/session-store";
import { renderWithProviders } from "@shared/test-fixtures/render-with-providers";

jest.mock("expo-router", () => ({
  Stack: () => null,
  useLocalSearchParams: () => ({
    eventId: "evt-1",
    sessionId: "sess-1",
    bookingId: "bk-1",
  }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

// eslint-disable-next-line import/first
import BookingLayout from "../../app/(booking)/_layout";
// eslint-disable-next-line import/first
import WaitingRoute from "../../app/(booking)/waiting/[eventId]";
// eslint-disable-next-line import/first
import CheckoutScreen from "../../app/(booking)/checkout/[sessionId]";
// eslint-disable-next-line import/first
import PaymentScreen from "../../app/(booking)/payment/[bookingId]";
// eslint-disable-next-line import/first
import SuccessScreen from "../../app/(booking)/success/[bookingId]";
// eslint-disable-next-line import/first
import SnapRoute from "../../app/(booking)/snap/[bookingId]";

describe("(booking) route shells", () => {
  it("export component functions", () => {
    expect(typeof BookingLayout).toBe("function");
    expect(typeof WaitingRoute).toBe("function");
    expect(typeof CheckoutScreen).toBe("function");
    expect(typeof PaymentScreen).toBe("function");
    expect(typeof SuccessScreen).toBe("function");
    expect(typeof SnapRoute).toBe("function");
  });

  it("renders the booking layout without crashing", () => {
    expect(() => renderWithProviders(<BookingLayout />)).not.toThrow();
  });

  it("Waiting route mounts the WaitingRoomScreen (no active queue → no-queue state)", () => {
    useSessionStore.getState().reset();
    renderWithProviders(<WaitingRoute />);
    expect(screen.getByTestId("waiting-noqueue")).toBeTruthy();
  });
});
