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
  it("shows booking details and exposes the QR action for a paid booking", () => {
    const onOpenQr = jest.fn();
    render(<AccountBookingCard booking={booking} onOpenQr={onOpenQr} />);

    expect(screen.getByText("Stadium Tour Jakarta")).toBeTruthy();
    expect(screen.getByText("RBT-2026-001 · Lunas")).toBeTruthy();
    fireEvent.press(screen.getByTestId("account-ticket-qr-booking-1"));
    expect(onOpenQr).toHaveBeenCalledWith(booking);
  });

  it("does not expose QR access before payment is complete", () => {
    render(
      <AccountBookingCard
        booking={{ ...booking, status: "PENDING_PAYMENT" }}
        onOpenQr={jest.fn()}
      />,
    );

    expect(screen.getByText(/Menunggu Pembayaran/)).toBeTruthy();
    expect(screen.queryByTestId("account-ticket-qr-booking-1")).toBeNull();
  });
});
