/**
 * RBT-089 —  Brutalist Mono Browse Grid
 *
 * PROTOTYPE 05-browse.html .events-grid EXACT COPY:
 * - Cards: 2px border, grayscale→color on hover
 * - Hover: 8px shadow offset, -4px translate
 * - Badge: HOT (red), NEW (green)
 * - Multi-column grid on desktop
 * - Mobile: 2 columns with 16px gap (--space-s)
 * - Desktop: responsive columns with 32px gap (2rem)
 */
import { Platform, View } from "react-native";

import { EventCard, Reveal } from "@presentation/components";

import type { BrowseGridProps } from "../../interface";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { browseGridCell, browseGridRow, browseGridList } from "../../style";

const isNative = Platform.OS !== "web";

export function BrowseGrid({ events, onPress, columns = 1 }: BrowseGridProps) {
  const { isMobileWeb } = useResponsive();
  const isListMode = columns <= 1 || isMobileWeb;

  if (isListMode) {
    return (
      <View style={browseGridList(isNative, isMobileWeb)} testID="browse-grid">
        {events.map((ev, i) => (
          <Reveal key={ev.id} delay={i * 80}>
            <EventCard event={ev} onPress={onPress} listMode />
          </Reveal>
        ))}
      </View>
    );
  }

  return (
    <View style={browseGridRow(isNative)} testID="browse-grid">
      {events.map((ev, i) => (
        <View key={ev.id} style={browseGridCell(columns, isNative)}>
          <Reveal delay={i * 80}>
            <EventCard event={ev} onPress={onPress} />
          </Reveal>
        </View>
      ))}
    </View>
  );
}
