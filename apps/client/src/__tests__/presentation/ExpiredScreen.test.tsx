import { fireEvent, render, screen } from "@testing-library/react-native";

import { useSessionStore } from "@presentation/stores/session-store";
import { ExpiredScreen } from "@presentation/screens/Expired";

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
    expect(screen.getByText("Waktu pembayaranmu habis")).toBeTruthy();
    expect(screen.getByText(/Ref: bk-1/)).toBeTruthy();
    expect(screen.getByText("Masuk Antrean Lagi")).toBeTruthy();
  });

  it("renders payment-failed copy with the 'coba metode lain' CTA", () => {
    render(<ExpiredScreen resourceId="bk-1" reason="payment-failed" />);
    expect(screen.getByText("Pembayaran belum berhasil")).toBeTruthy();
    expect(screen.getByText("Coba Metode Lain")).toBeTruthy();
  });

  it("renders booking/selection copy for reason=session and for an unknown reason", () => {
    const { rerender } = render(<ExpiredScreen resourceId="s-1" reason="session" />);
    expect(screen.getByText("Waktu memilih tiket habis")).toBeTruthy();
    rerender(<ExpiredScreen resourceId="s-1" reason="whatever" />);
    expect(screen.getByText("Waktu memilih tiket habis")).toBeTruthy();
    rerender(<ExpiredScreen resourceId="s-1" />);
    expect(screen.getByText("Waktu memilih tiket habis")).toBeTruthy();
  });

  it("re-queues to the event when an eventId is known", () => {
    useSessionStore.getState().setQueue("evt-7", "q-1", "WAITING");
    render(<ExpiredScreen resourceId="bk-1" reason="payment" />);
    fireEvent.press(screen.getByTestId("expired-requeue"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/events/evt-7");
    expect(useSessionStore.getState().eventId).toBeUndefined(); // reset ran
  });

  it("re-queues home when no eventId is known, and the ghost button routes home", () => {
    render(<ExpiredScreen resourceId="bk-1" reason="session" />);
    // Both the primary requeue (no event) and the ghost home button go home.
    fireEvent.press(screen.getByTestId("expired-requeue"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
    mockRouter.replace.mockClear();
    fireEvent.press(screen.getByTestId("expired-home"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });
});
