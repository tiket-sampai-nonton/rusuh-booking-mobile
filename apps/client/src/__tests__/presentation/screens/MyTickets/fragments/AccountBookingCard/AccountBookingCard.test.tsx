import { fireEvent, render, screen } from "@testing-library/react-native";
import type { MyBookingSummary } from "@domain/repositories/ticket-history.repository";
import { AccountBookingCard } from "../../../../../../presentation/screens/MyTickets/fragments/AccountBookingCard/index";

const booking: MyBookingSummary = {
  bookingId: "booking-1",
  publicRef: "RBT-2026-001",
  eventName: "Stadium Tour Jakarta",
  status: "PAID",
  amountMinor: 45000000,
};

describe("AccountBookingCard", () => {
  it("shows booking details and exposes the ticket detail action for a paid booking", () => {
    const onOpenQr = jest.fn();
    render(<AccountBookingCard booking={booking} onOpenQr={onOpenQr} />);

    expect(screen.getByText("Stadium Tour Jakarta")).toBeTruthy();
    expect(screen.getByText("RBT-2026-001 · Lunas")).toBeTruthy();
    expect(screen.getByText("Lihat Detail Tiket")).toBeTruthy();
    fireEvent.press(screen.getByTestId("account-ticket-booking-1"));
    expect(onOpenQr).toHaveBeenCalledWith(booking);
  });

  it("opens order details before payment is complete without exposing a QR", () => {
    const onOpenQr = jest.fn();
    render(
      <AccountBookingCard
        booking={{ ...booking, status: "PENDING_PAYMENT" }}
        onOpenQr={onOpenQr}
      />,
    );

    expect(screen.getByText(/Menunggu Pembayaran/)).toBeTruthy();
    fireEvent.press(screen.getByTestId("account-ticket-booking-1"));
    expect(onOpenQr).toHaveBeenCalledWith({
      ...booking,
      status: "PENDING_PAYMENT",
    });
    expect(screen.getByText("Lihat Detail Tiket")).toBeTruthy();
  });
});
