import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking, Platform } from 'react-native';

import { Venue } from '../../../../../../presentation/screens/EventDetail/fragments/Venue/index';

describe('Venue', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform }));
  afterEach(() => jest.restoreAllMocks());

  it('renders venue details and opens the supplied maps link', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined);
    render(<Venue name="GBK" address="Jakarta" mapImage="https://example.com/map.jpg" mapsUrl="https://maps.example/gbk" />);

    expect(screen.getByText('GBK')).toBeTruthy();
    expect(screen.getByText('Jakarta')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Buka lokasi GBK di maps' }));
    expect(openURL).toHaveBeenCalledWith('https://maps.example/gbk');
  });

  it('builds a maps search URL when no URL is supplied', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined);
    render(<Venue name="Gelora Bung Karno" address="Jakarta Selatan" />);
    fireEvent.press(screen.getByRole('button', { name: 'Buka lokasi Gelora Bung Karno di maps' }));
    expect(openURL).toHaveBeenCalledWith('https://www.google.com/maps/search/?api=1&query=Gelora%20Bung%20Karno%20Jakarta%20Selatan');
  });

  it('reveals the map overlay on web hover', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    render(<Venue name="GBK" address="Jakarta" />);
    const map = screen.getByRole('button', { name: 'Buka lokasi GBK di maps' });
    fireEvent(map, 'hoverIn');
    fireEvent(map, 'hoverOut');
    expect(screen.getByText('Buka Peta')).toBeTruthy();
  });
});
