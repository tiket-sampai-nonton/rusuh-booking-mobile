import { fireEvent, render, screen } from '@testing-library/react-native';

let mockReducedMotion = true;
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return { ...actual, useReducedMotion: () => mockReducedMotion };
});

// eslint-disable-next-line import/first
import { ToastProvider } from '@presentation/components/design-system';
// eslint-disable-next-line import/first
import { HomeFooter } from '@presentation/screens/Home/fragments/HomeFooter';

describe('HomeFooter', () => {
  afterEach(() => {
    mockReducedMotion = true;
  });

  it('routes an event category link through the owning screen', () => {
    const onNavigate = jest.fn();
    render(
      <ToastProvider>
        <HomeFooter onNavigate={onNavigate} />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByLabelText('Konser'));

    expect(onNavigate).toHaveBeenCalledWith('/browse?genre=concert');
  });

  it('renders the link columns and shows the selected social profile', () => {
    const onNavigate = jest.fn();
    render(
      <ToastProvider>
        <HomeFooter onNavigate={onNavigate} />
      </ToastProvider>,
    );

    expect(screen.getByText('Bantuan')).toBeTruthy();
    expect(screen.getByText('Perusahaan')).toBeTruthy();
    expect(screen.getByText('© 2025 Rusuh Tiket. Hak cipta dilindungi.')).toBeTruthy();
    const instagram = screen.getByLabelText('Instagram: @rusuhtiket');
    fireEvent(instagram, 'hoverIn');
    fireEvent(instagram, 'hoverOut');
    fireEvent.press(instagram);
    expect(screen.getByText('Instagram: @rusuhtiket')).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('keeps placeholder footer links inert and handles pointer states', () => {
    const onNavigate = jest.fn();
    render(
      <ToastProvider>
        <HomeFooter onNavigate={onNavigate} />
      </ToastProvider>,
    );
    const link = screen.getByLabelText('Pusat Bantuan');
    fireEvent(link, 'hoverIn');
    fireEvent(link, 'hoverOut');
    fireEvent.press(link);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('runs the animated hover states for footer links and social items', () => {
    mockReducedMotion = false;
    const onNavigate = jest.fn();
    render(
      <ToastProvider>
        <HomeFooter onNavigate={onNavigate} />
      </ToastProvider>,
    );
    const eventLink = screen.getByLabelText('Festival');
    const socialLink = screen.getByLabelText('YouTube: Rusuh Tiket Official');

    fireEvent(eventLink, 'hoverIn');
    fireEvent(eventLink, 'hoverOut');
    fireEvent(socialLink, 'hoverIn');
    fireEvent(socialLink, 'hoverOut');
    fireEvent.press(socialLink);

    expect(screen.getByText('YouTube: Rusuh Tiket Official')).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
