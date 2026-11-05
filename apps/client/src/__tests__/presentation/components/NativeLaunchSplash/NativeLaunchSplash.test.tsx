import { act, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

let mockReducedMotion = true;
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useReducedMotion: () => mockReducedMotion,
}));

// eslint-disable-next-line import/first
import { NativeLaunchSplash } from '../../../../presentation/components/NativeLaunchSplash/index';

describe('NativeLaunchSplash', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    jest.useRealTimers();
    mockReducedMotion = true;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
  });

  it('does not render on web', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const onFinish = jest.fn();
    render(<NativeLaunchSplash onFinish={onFinish} />);
    expect(screen.queryByTestId('native-launch-splash')).toBeNull();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('renders the native wordmark and completes the reduced-motion splash', () => {
    jest.useFakeTimers();
    mockReducedMotion = true;
    const onFinish = jest.fn();
    render(<NativeLaunchSplash onFinish={onFinish} />);

    expect(screen.getByTestId('native-launch-splash').props.accessibilityLabel).toBe('Memuat Rusuh Tiket');
    expect(screen.getByText('Tiket Tanpa Ribet')).toBeTruthy();
    act(() => jest.advanceTimersByTime(2500));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('runs the entrance and exit animation path when motion is enabled', () => {
    jest.useFakeTimers();
    mockReducedMotion = false;
    const onFinish = jest.fn();
    render(<NativeLaunchSplash onFinish={onFinish} />);

    act(() => jest.advanceTimersByTime(2500));

    expect(screen.getByTestId('native-launch-splash')).toBeTruthy();
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
