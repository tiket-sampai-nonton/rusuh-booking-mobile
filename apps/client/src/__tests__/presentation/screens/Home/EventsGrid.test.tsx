import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { EVENT_FIXTURES } from '@shared/test-fixtures/events.fixture';
import { EventsGrid } from '@presentation/screens/Home/fragments/HomeSections/fragments/EventsGrid';

jest.mock('@presentation/components/design-system', () => {
  const ReactMock = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    EventCard: ({ event, onPress }: { event: { id: string; name: string }; onPress: (id: string) => void }) =>
      ReactMock.createElement(
        Pressable,
        { accessibilityRole: 'button', onPress: () => onPress(event.id) },
        ReactMock.createElement(Text, null, event.name),
      ),
    Reveal: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe('EventsGrid', () => {
  it('renders its empty state without cards', () => {
    render(<EventsGrid events={[]} onPress={jest.fn()} columns={2} />);

    expect(screen.getByText('Belum ada event yang cocok.')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders event cards and routes presses to the selected event', () => {
    const onPress = jest.fn();
    const event = EVENT_FIXTURES[0];

    render(<EventsGrid events={[event]} onPress={onPress} columns={2} history />);
    fireEvent.press(screen.getByRole('button'));

    expect(screen.getByText(event.name)).toBeTruthy();
    expect(onPress).toHaveBeenCalledWith(event.id);
  });
});
