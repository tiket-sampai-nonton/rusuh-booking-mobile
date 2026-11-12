import { fireEvent, render, screen } from "@testing-library/react-native";

import { TicketCard } from "../../../../../../presentation/screens/MyTickets/fragments/TicketCard/index";

const baseProps = {
  event: {
    id: "event-1",
    name: "Stadium Tour",
    venue: "GBK",
    startsAt: "2026-11-28T19:00:00+07:00",
  },
  bookingId: "booking-1",
  amountMinor: 75000000,
  ticketCount: 2,
  onOpenQr: jest.fn(),
  onDownload: jest.fn(),
  onShare: jest.fn(),
};

describe("TicketCard", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders ticket details and invokes its actions", () => {
    render(<TicketCard {...baseProps} />);

    expect(screen.getByText("Stadium Tour")).toBeTruthy();
    expect(screen.getByText("Terkonfirmasi")).toBeTruthy();
    expect(screen.getByText("2 tiket")).toBeTruthy();

    fireEvent.press(screen.getByTestId("ticket-qr-booking-1"));
    fireEvent.press(screen.getByTestId("ticket-download-booking-1"));
    fireEvent.press(screen.getByTestId("ticket-share-booking-1"));

    expect(baseProps.onOpenQr).toHaveBeenCalledTimes(1);
    expect(baseProps.onDownload).toHaveBeenCalledTimes(1);
    expect(baseProps.onShare).toHaveBeenCalledTimes(1);
  });

  it("shows grouped category counts when the issued ticket data is available", () => {
    render(
      <TicketCard
        {...baseProps}
        categoryCounts={[
          { categoryCode: "REG", count: 1 },
          { categoryCode: "VIP", count: 1 },
        ]}
      />,
    );

    expect(screen.getByText("1 × REG · 1 × VIP")).toBeTruthy();
  });

  it("marks a past ticket as used and disables QR access", () => {
    render(<TicketCard {...baseProps} past />);

    expect(screen.getByText("Terpakai")).toBeTruthy();
    expect(
      screen.getByTestId("ticket-qr-booking-1").props.accessibilityState
        .disabled,
    ).toBe(true);
    fireEvent.press(screen.getByTestId("ticket-qr-booking-1"));
    expect(baseProps.onOpenQr).not.toHaveBeenCalled();
  });
});
