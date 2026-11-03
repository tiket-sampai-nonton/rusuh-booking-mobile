/**
 * RBT-089 — V2 Brutalist Mono Browse Grid
 *
 * PROTOTYPE 05-browse.html .events-grid EXACT COPY:
 * - Cards: 2px border, grayscale→color on hover
 * - Hover: 8px shadow offset, -4px translate
 * - Badge: HOT (red), NEW (green)
 * - Wishlist button: heart icon
 * - Multi-column grid on desktop
 */
import { View } from 'react-native';

import { V2EventCard, V2Reveal } from '@presentation/components/v2';

import type { BrowseGridProps } from '../interface';
import { browseGridCell, browseGridRow, browseGridList } from '../style';

export function BrowseGrid({ events, onPress, columns = 1 }: BrowseGridProps) {
  if (columns <= 1) {
    return (
      <View style={browseGridList} testID="browse-grid">
        {events.map((ev, i) => (
          <V2Reveal key={ev.id} delay={i * 80}>
            <V2EventCard event={ev} onPress={onPress} />
          </V2Reveal>
        ))}
      </View>
    );
  }

  return (
    <View style={browseGridRow} testID="browse-grid">
      {events.map((ev, i) => (
        <View key={ev.id} style={browseGridCell(columns)}>
          <V2Reveal delay={i * 80}>
            <V2EventCard event={ev} onPress={onPress} />
          </V2Reveal>
        </View>
      ))}
    </View>
  );
}
