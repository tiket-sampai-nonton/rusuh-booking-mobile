import { fireEvent, render, screen } from '@testing-library/react-native';
import { TicketQrSheet, ticketQrBackdropStyle } from '../../../../../../presentation/screens/MyTickets/fragments/TicketQrSheet/index';

const baseProps = {
  eventName: 'Stadium Tour Jakarta',
  bookingId: 'booking-1',
  isLoading: false,
  isError: false,
  downloadError: '',
  onDownload: jest.fn(),
  onClose: jest.fn(),
};

describe('TicketQrSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows a fallback QR and closes from either close affordance', () => {
    render(<TicketQrSheet {...baseProps} />);

    expect(screen.getByText('Stadium Tour Jakarta')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Tutup QR tiket' })).toBeTruthy();
    expect(screen.getByTestId('qr-code').props.accessibilityLabel).toBe('RBT|booking-1|1');
    fireEvent.press(screen.getByTestId('ticket-qr-close'));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('uses a safe booking placeholder and centers the backdrop on web', () => {
    render(<TicketQrSheet {...baseProps} bookingId="" />);

    expect(screen.getByTestId('qr-code').props.accessibilityLabel).toBe('RBT|booking|1');
    expect(ticketQrBackdropStyle('web')).toMatchObject({ justifyContent: 'center', padding: 24 });
    expect(ticketQrBackdropStyle('android')).toMatchObject({ justifyContent: 'flex-end', padding: 0 });
  });

  it('shows loading and error states for account-ticket QR data', () => {
    const ticket = { ticketCode: 'T-1', qrPayload: 'safe-payload' };
    const { rerender } = render(
      <TicketQrSheet {...baseProps} bookingTickets={[]} isLoading />,
    );
    expect(screen.getByText('Memuat QR…')).toBeTruthy();

    rerender(<TicketQrSheet {...baseProps} bookingTickets={[ticket]} isError />);
    expect(screen.getByText('QR tiket gagal dimuat. Silakan coba lagi.')).toBeTruthy();
  });

  it('renders each ticket code and downloads the account booking', () => {
    const onDownload = jest.fn();
    render(
      <TicketQrSheet
        {...baseProps}
        bookingTickets={[{ ticketCode: 'T-1', qrPayload: 'safe-payload' }]}
        onDownload={onDownload}
      />,
    );

    expect(screen.getByText('T-1')).toBeTruthy();
    expect(screen.getByTestId('qr-code').props.accessibilityLabel).toBe('safe-payload');
    fireEvent.press(screen.getByText('Unduh E-Tiket'));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('does not close when a tap stays inside the sheet and shows download errors', () => {
    render(<TicketQrSheet {...baseProps} downloadError="Unduhan gagal." />);

    fireEvent.press(screen.getByTestId('ticket-qr-sheet'));
    expect(baseProps.onClose).not.toHaveBeenCalled();
    expect(screen.getByText('Unduhan gagal.')).toBeTruthy();
  });
});
