import { fireEvent, render, screen } from "@testing-library/react-native";

import { useSessionStore } from "@presentation/stores/session-store";
import { ExpiredScreen } from "@presentation/screens/Expired/ExpiredScreen";

const mockRouter = { replace: jest.fn(), push: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

describe("ExpiredScreen", () => {
  beforeEach(() => {
    mockRouter.replace.mockReset();
    useSessionStore.getState().reset();
  });

  it("renders payment-expiry copy for reason=payment", () => {
    render(<ExpiredScreen resourceId="bk-1" reason="payment" />);
    expect(screen.getByText("Waktu Pembayaran Habis")).toBeTruthy();
    expect(screen.getByText(/Ref: bk-1/)).toBeTruthy();
  });

  it("renders payment-failed copy", () => {
    render(<ExpiredScreen resourceId="bk-1" reason="payment-failed" />);
    expect(screen.getByText("Pembayaran Gagal")).toBeTruthy();
  });

  it("renders session copy for reason=session and for an unknown reason", () => {
    const { rerender } = render(<ExpiredScreen resourceId="s-1" reason="session" />);
    expect(screen.getByText("Sesi Berakhir")).toBeTruthy();
    rerender(<ExpiredScreen resourceId="s-1" reason="whatever" />);
    expect(screen.getByText("Sesi Berakhir")).toBeTruthy();
    rerender(<ExpiredScreen resourceId="s-1" />);
    expect(screen.getByText("Sesi Berakhir")).toBeTruthy();
  });

  it("re-queues to the event when an eventId is known", () => {
    useSessionStore.getState().setQueue("evt-7", "q-1", "WAITING");
    render(<ExpiredScreen resourceId="bk-1" reason="payment" />);
    fireEvent.press(screen.getByTestId("expired-requeue"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/events/evt-7");
    expect(useSessionStore.getState().eventId).toBeUndefined(); // reset ran
  });

  it("routes home when no eventId is known", () => {
    render(<ExpiredScreen resourceId="bk-1" reason="session" />);
    expect(screen.getByText("Ke Beranda →")).toBeTruthy();
    fireEvent.press(screen.getByTestId("expired-requeue"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });
});
