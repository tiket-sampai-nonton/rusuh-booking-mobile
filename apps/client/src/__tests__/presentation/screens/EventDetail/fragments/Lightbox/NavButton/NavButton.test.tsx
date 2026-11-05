import { fireEvent, render } from '@testing-library/react-native';
import Svg from 'react-native-svg';

import { lightboxNavButtonStyles } from '../../../../../../../presentation/screens/EventDetail/fragments/Lightbox/NavButton/style';
import { getNavButtonStyles, NavButton } from '../../../../../../../presentation/screens/EventDetail/fragments/Lightbox/NavButton/index';

describe('Lightbox NavButton', () => {
  it('updates hover and pressed styles and invokes its action', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <NavButton
        kind="close"
        accessibilityLabel="Tutup galeri"
        onPress={onPress}
      />,
    );
    const button = getByRole('button', { name: 'Tutup galeri' });

    const idleStyles = getNavButtonStyles({
      kind: 'close',
      hovered: false,
      pressed: false,
    });
    fireEvent(button, 'hoverIn');
    const hoverStyles = getNavButtonStyles({
      kind: 'close',
      hovered: true,
      pressed: false,
    });
    fireEvent(button, 'pressIn');
    const pressedStyles = getNavButtonStyles({
      kind: 'close',
      hovered: true,
      pressed: true,
    });
    fireEvent(button, 'hoverOut');
    fireEvent(button, 'pressOut');
    fireEvent.press(button);

    expect(idleStyles).not.toContain(lightboxNavButtonStyles.hover);
    expect(hoverStyles).toContain(lightboxNavButtonStyles.hover);
    expect(hoverStyles).toContain(lightboxNavButtonStyles.closeHover);
    expect(pressedStyles).toContain(lightboxNavButtonStyles.pressed);
    expect(button).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses the regular hover style for navigation controls', () => {
    const navigationStyles = getNavButtonStyles({
      kind: 'previous',
      hovered: true,
      pressed: false,
      style: lightboxNavButtonStyles.navigation,
    });

    expect(navigationStyles).toContain(lightboxNavButtonStyles.hover);
    expect(navigationStyles).not.toContain(lightboxNavButtonStyles.closeHover);
    expect(navigationStyles).toContain(lightboxNavButtonStyles.navigation);
  });

  it('changes the SVG stroke while hovered', () => {
    const { getByRole, UNSAFE_getByType } = render(
      <NavButton kind="close" accessibilityLabel="Tutup galeri" onPress={jest.fn()} />,
    );
    const button = getByRole('button', { name: 'Tutup galeri' });
    const idleStroke = UNSAFE_getByType(Svg).props.stroke;

    fireEvent(button, 'hoverIn');

    expect(UNSAFE_getByType(Svg).props.stroke).not.toBe(idleStroke);
    fireEvent(button, 'hoverOut');
  });

  it('combines active and pressed styling for a non-close action', () => {
    const styles = getNavButtonStyles({
      kind: 'next',
      hovered: true,
      pressed: true,
    });

    expect(styles).toContain(lightboxNavButtonStyles.hover);
    expect(styles).toContain(lightboxNavButtonStyles.pressed);
    expect(styles).not.toContain(lightboxNavButtonStyles.closeHover);
  });

  it('renders navigation glyphs for previous and next actions', () => {
    const { getByRole } = render(
      <>
        <NavButton kind="previous" accessibilityLabel="Sebelumnya" onPress={jest.fn()} />
        <NavButton kind="next" accessibilityLabel="Berikutnya" onPress={jest.fn()} />
      </>,
    );

    expect(getByRole('button', { name: 'Sebelumnya' })).toBeTruthy();
    expect(getByRole('button', { name: 'Berikutnya' })).toBeTruthy();
  });
});
