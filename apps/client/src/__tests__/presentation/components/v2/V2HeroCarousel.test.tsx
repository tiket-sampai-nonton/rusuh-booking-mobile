import { act, render } from '@testing-library/react-native';

import { EVENT_FIXTURES } from '@shared/test-fixtures/events.fixture';

let mockReducedMotion = false;
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return { ...actual, useReducedMotion: () => mockReducedMotion };
});

// eslint-disable-next-line import/first
import { V2HeroCarousel } from '@presentation/components/v2/V2HeroCarousel';

describe('V2HeroCarousel', () => {
  afterEach(() => {
    jest.useRealTimers();
    mockReducedMotion = false;
  });

  it('automatically advances through the supplied hero events', () => {
    jest.useFakeTimers();
    const { getByTestId } = render(
      <V2HeroCarousel events={EVENT_FIXTURES.slice(0, 3)} onBook={jest.fn()} onSeeAll={jest.fn()} />,
    );

    expect(getByTestId('hero-book').props.accessibilityLabel).toBe('Beli tiket untuk Rusuh Fest 2026');
    act(() => jest.advanceTimersByTime(6000));
    expect(getByTestId('hero-book').props.accessibilityLabel).toBe('Beli tiket untuk Nonton Bareng Finale');
  });

  it('rotates without motion effects when reduced motion is enabled', () => {
    jest.useFakeTimers();
    mockReducedMotion = true;
    const { getByTestId } = render(
      <V2HeroCarousel events={EVENT_FIXTURES.slice(0, 3)} onBook={jest.fn()} onSeeAll={jest.fn()} />,
    );

    expect(getByTestId('hero-book').props.accessibilityLabel).toBe('Beli tiket untuk Rusuh Fest 2026');
    act(() => jest.advanceTimersByTime(6000));
    expect(getByTestId('hero-book').props.accessibilityLabel).toBe('Beli tiket untuk Nonton Bareng Finale');
  });
});
