import { render, screen } from "@testing-library/react-native";

const mockUseLocalSearchParams = jest.fn(
  (): { eventId?: string; sessionId?: string; bookingId?: string } => ({
    eventId: "evt-1",
    sessionId: "sess-1",
    bookingId: "bk-1",
  }),
);

jest.mock("expo-router", () => ({
  Stack: () => null,
  useRouter: () => ({ replace: jest.fn() }),
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));
jest.mock("@presentation/components/Seo", () => ({ Seo: () => null }));
jest.mock("@presentation/screens/Checkout", () => ({
  CheckoutScreen: jest.fn(() => null),
}));
jest.mock("@presentation/screens/Payment", () => ({
  PaymentScreen: jest.fn(() => null),
}));
jest.mock("@presentation/screens/PaymentResult", () => ({
  PaymentResultScreen: jest.fn(() => null),
}));
jest.mock("@presentation/screens/PaymentWebView", () => ({
  PaymentWebViewScreen: jest.fn(() => null),
}));
jest.mock("@presentation/screens/Success", () => ({
  SuccessScreen: jest.fn(() => null),
}));
jest.mock("@presentation/screens/MyTickets", () => ({
  MyTicketsScreen: jest.fn(() => null),
}));
jest.mock("@presentation/screens/Profile", () => ({
  ProfileScreen: jest.fn(() => null),
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
// eslint-disable-next-line import/first
import PaymentResultRoute from "../../app/(booking)/payment-result/[bookingId]";
// eslint-disable-next-line import/first
import PaymentWebViewRoute from "../../app/(booking)/payment-webview/[bookingId]";
// eslint-disable-next-line import/first
import MyTicketsRoute from "../../app/(public)/my-tickets";
// eslint-disable-next-line import/first
import ProfileRoute from "../../app/(public)/profile";
// eslint-disable-next-line import/first
import { CheckoutScreen as MockCheckoutScreen } from "@presentation/screens/Checkout";
// eslint-disable-next-line import/first
import { PaymentScreen as MockPaymentScreen } from "@presentation/screens/Payment";
// eslint-disable-next-line import/first
import { PaymentResultScreen as MockPaymentResultScreen } from "@presentation/screens/PaymentResult";
// eslint-disable-next-line import/first
import { PaymentWebViewScreen as MockPaymentWebViewScreen } from "@presentation/screens/PaymentWebView";
// eslint-disable-next-line import/first
import { SuccessScreen as MockSuccessScreen } from "@presentation/screens/Success";
// eslint-disable-next-line import/first
import { MyTicketsScreen as MockMyTicketsScreen } from "@presentation/screens/MyTickets";
// eslint-disable-next-line import/first
import { ProfileScreen as MockProfileScreen } from "@presentation/screens/Profile";

describe("(booking) routes", () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({
      eventId: "evt-1",
      sessionId: "sess-1",
      bookingId: "bk-1",
    });
  });

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
    //  uses the localized no-queue message.
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

  it("passes route parameters to each transactional screen", () => {
    render(<CheckoutScreen />);
    expect((MockCheckoutScreen as jest.Mock).mock.calls.at(-1)?.[0]).toEqual({
      sessionId: "sess-1",
    });

    render(<PaymentScreen />);
    expect((MockPaymentScreen as jest.Mock).mock.calls.at(-1)?.[0]).toEqual({
      bookingId: "bk-1",
    });

    render(<PaymentResultRoute />);
    expect(
      (MockPaymentResultScreen as jest.Mock).mock.calls.at(-1)?.[0],
    ).toEqual({ bookingId: "bk-1", attemptId: undefined });

    render(<PaymentWebViewRoute />);
    expect(
      (MockPaymentWebViewScreen as jest.Mock).mock.calls.at(-1)?.[0],
    ).toEqual({ bookingId: "bk-1" });

    render(<SuccessScreen />);
    expect((MockSuccessScreen as jest.Mock).mock.calls.at(-1)?.[0]).toEqual({
      bookingId: "bk-1",
    });
  });

  it("uses an empty id when a transactional route parameter is missing", () => {
    mockUseLocalSearchParams.mockReturnValue({});

    render(<CheckoutScreen />);
    expect((MockCheckoutScreen as jest.Mock).mock.calls.at(-1)?.[0]).toEqual({
      sessionId: "",
    });

    render(<PaymentScreen />);
    expect((MockPaymentScreen as jest.Mock).mock.calls.at(-1)?.[0]).toEqual({
      bookingId: "",
    });

    render(<PaymentResultRoute />);
    expect(
      (MockPaymentResultScreen as jest.Mock).mock.calls.at(-1)?.[0],
    ).toEqual({ bookingId: "", attemptId: undefined });

    render(<PaymentWebViewRoute />);
    expect(
      (MockPaymentWebViewScreen as jest.Mock).mock.calls.at(-1)?.[0],
    ).toEqual({ bookingId: "" });

    render(<SuccessScreen />);
    expect((MockSuccessScreen as jest.Mock).mock.calls.at(-1)?.[0]).toEqual({
      bookingId: "",
    });
  });

  it("renders the public account route wrappers", () => {
    render(<MyTicketsRoute />);
    render(<ProfileRoute />);
    expect(MockMyTicketsScreen).toHaveBeenCalled();
    expect(MockProfileScreen).toHaveBeenCalled();
  });
});
