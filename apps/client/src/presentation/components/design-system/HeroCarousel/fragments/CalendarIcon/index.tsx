import Svg, { Path, Rect } from 'react-native-svg';

import { designColors } from '@presentation/theme';

import { ICON_SIZE } from '../../constants';

export function CalendarIcon({ color = designColors.ink }: { readonly color?: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={color} strokeWidth={2} />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
