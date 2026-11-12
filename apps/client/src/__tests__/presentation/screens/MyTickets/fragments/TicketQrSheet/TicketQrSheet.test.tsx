import { fireEvent, render, screen } from "@testing-library/react-native";
import {
  TicketQrSheet,
  ticketQrBackdropStyle,
  ticketQrCardPointerEvents,
} from "../../../../../../presentation/screens/MyTickets/fragments/TicketQrSheet/index";

const baseProps = {
  eventName: "Stadium Tour Jakarta",
  bookingId: "booking-1",
  isLoading: false,
  isError: false,
  downloadError: "",
  onDownload: jest.fn(),
  onClose: jest.fn(),
};

describe("TicketQrSheet", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does not fabricate a QR when ticket data is unavailable and still closes", () => {
    render(<TicketQrSheet {...baseProps} />);

    expect(screen.getByText("Stadium Tour Jakarta")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tutup QR tiket" })).toBeTruthy();
    expect(
      screen.getByText("Data QR tiket belum tersedia. Coba muat kembali."),
    ).toBeTruthy();
    expect(screen.queryByTestId("qr-code")).toBeNull();
    fireEvent.press(screen.getByTestId("ticket-qr-close"));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps missing booking data in an unavailable state and centers the backdrop on web", () => {
    render(<TicketQrSheet {...baseProps} bookingId="" />);

    expect(
      screen.getByText("Data QR tiket belum tersedia. Coba muat kembali."),
    ).toBeTruthy();
    expect(screen.queryByTestId("qr-code")).toBeNull();
    expect(ticketQrBackdropStyle("web")).toMatchObject({
      justifyContent: "center",
      padding: 24,
    });
    expect(ticketQrBackdropStyle("android")).toMatchObject({
      justifyContent: "flex-end",
      padding: 0,
    });
  });

  it("shows loading and retryable error states for account-ticket QR data", () => {
    const onRetry = jest.fn();
    const { rerender } = render(<TicketQrSheet {...baseProps} isLoading />);
    expect(screen.getByText("Memuat QR…")).toBeTruthy();

    rerender(
      <TicketQrSheet
        {...baseProps}
        isError
        errorMessage="Layanan sedang mengalami gangguan. Coba lagi sebentar."
        onRetry={onRetry}
      />,
    );
    expect(
      screen.getByText(
        "Layanan sedang mengalami gangguan. Coba lagi sebentar.",
      ),
    ).toBeTruthy();
    fireEvent.press(screen.getByTestId("ticket-qr-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders each ticket code and downloads the account booking", () => {
    const onDownload = jest.fn();
    render(
      <TicketQrSheet
        {...baseProps}
        bookingTickets={[
          {
            ticketCode: "T-1",
            qrPayload: "safe-payload",
            categoryCode: "VIP",
            attendeeName: "Rizky",
            attendeeNikMasked: "31****89",
          },
        ]}
        onDownload={onDownload}
      />,
    );

    expect(screen.getByText("T-1")).toBeTruthy();
    expect(screen.getByText("Kategori VIP")).toBeTruthy();
    expect(screen.getByText("Rizky · 31****89")).toBeTruthy();
    expect(screen.getByTestId("qr-code").props.accessibilityLabel).toBe(
      "safe-payload",
    );
    expect(ticketQrCardPointerEvents("android")).toBe("none");
    expect(ticketQrCardPointerEvents("ios")).toBe("none");
    expect(ticketQrCardPointerEvents("web")).toBe("auto");
    fireEvent.press(screen.getByText("Unduh E-Tiket"));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it("shows booking details for an expired order without requesting or inventing a QR", () => {
    render(
      <TicketQrSheet
        {...baseProps}
        bookingSummary={{
          bookingId: "expired-1",
          publicRef: "RBT-EXPIRED-1",
          eventName: "Stadium Tour Jakarta",
          status: "EXPIRED",
          amountMinor: 275000,
        }}
      />,
    );

    expect(screen.getByText("Detail Tiket")).toBeTruthy();
    expect(screen.getByTestId("booking-order-summary")).toBeTruthy();
    expect(screen.getByText("Referensi RBT-EXPIRED-1")).toBeTruthy();
    expect(screen.getByText("Status EXPIRED")).toBeTruthy();
    expect(screen.getByText("Rp 275.000")).toBeTruthy();
    expect(screen.getByText(/e-tiket tidak diterbitkan/)).toBeTruthy();
    expect(screen.queryByTestId("qr-code")).toBeNull();
    expect(screen.queryByText("Unduh E-Tiket")).toBeNull();
  });

  it("keeps sheet gestures separate from the backdrop press handler", () => {
    render(<TicketQrSheet {...baseProps} downloadError="Unduhan gagal." />);

    expect(
      screen.getByTestId("ticket-qr-scrollview").props.nestedScrollEnabled,
    ).toBe(true);
    fireEvent.press(screen.getByTestId("ticket-qr-sheet"));
    expect(baseProps.onClose).not.toHaveBeenCalled();
    expect(screen.getByText("Unduhan gagal.")).toBeTruthy();
  });
});
