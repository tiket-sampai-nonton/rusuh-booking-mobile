import Svg, { Path } from 'react-native-svg';

import { palette } from '../../style';

export function QueueIcon({ kind, size = 28 }: { readonly kind: "lock" | "warning" | "alert" | "clock" | "ticket"; readonly size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={palette.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" testID={`waiting-icon-${kind}`} accessibilityLabel={`${kind} icon`}>
      {kind === "lock" ? <Path d="M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3" /> : null}
      {kind === "warning" ? <Path d="M12 3 2.5 20h19L12 3ZM12 9v5m0 3h.01" /> : null}
      {kind === "alert" ? <Path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 7v6m0 4h.01" /> : null}
      {kind === "clock" ? <Path d="M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> : null}
      {kind === "ticket" ? <Path d="M3 7h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V7Zm6 0v12" /> : null}
    </Svg>
  );
}
