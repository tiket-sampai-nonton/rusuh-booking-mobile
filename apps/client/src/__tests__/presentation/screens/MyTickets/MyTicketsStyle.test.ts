import { accountBookingColumnStyle, historyContainerStyle, ticketsScrollContent } from '@presentation/screens/MyTickets/style';

describe('MyTickets styles', () => {
  it('uses a two-column grid on web and a stacked list on native', () => {
    expect(historyContainerStyle(true).flexDirection).toBe('row');
    expect(historyContainerStyle(false).flexDirection).toBe('column');
  });

  it('selects a responsive booking column width', () => {
    expect(accountBookingColumnStyle(true, 1200).flexBasis).toBe('31%');
    expect(accountBookingColumnStyle(true, 800).flexBasis).toBe('48%');
    expect(accountBookingColumnStyle(true, 500).flexBasis).toBe('100%');
    expect(accountBookingColumnStyle(false, 1200).flexBasis).toBe('100%');
  });

  it('includes top and bottom safe-area insets in the ticket list', () => {
    expect(ticketsScrollContent(10, 20)).toMatchObject({
      paddingTop: 98,
      paddingBottom: 108,
      paddingHorizontal: 16,
    });
  });
});
