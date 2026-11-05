import { render } from '@testing-library/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, View } from 'react-native';

import { GradientOverlay } from '../../../../../../../presentation/components/design-system/HeroCarousel/fragments/GradientOverlay/index';

describe('GradientOverlay', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalPlatform,
    });
  });

  it('uses the desktop gradient on web', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    const { UNSAFE_getByType } = render(<GradientOverlay />);
    const overlay = UNSAFE_getByType(View);

    expect(overlay.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          background: expect.stringContaining('rgba(255,255,255,0.7) 30%'),
        }),
      ]),
    );
  });

  it('uses the stronger mobile gradient on web', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    const { UNSAFE_getByType } = render(<GradientOverlay isMobile />);
    const overlay = UNSAFE_getByType(View);

    expect(overlay.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          background: expect.stringContaining('rgba(255,255,255,0.95) 30%'),
        }),
      ]),
    );
  });

  it('uses a native linear gradient on Android', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });

    const { UNSAFE_getByType } = render(<GradientOverlay />);
    const gradient = UNSAFE_getByType(LinearGradient);

    expect(gradient.props.locations).toEqual([0, 0.4, 0.7, 1]);
  });
});
