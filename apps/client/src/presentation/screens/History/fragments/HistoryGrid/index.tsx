/**
 * History results grid — past/CLOSED events with EventCard.
 *
 *  Brutalist design:
 * - Ink background with 2px gap creates border effect
 * - Single column (mobile) or multi-column (desktop)
 * - EventCard in `history` mode (dimmed, disabled)
 */
import { View } from "react-native";

import { EventCard } from "@presentation/components/design-system/EventCard";

import type { HistoryGridProps } from "../../interface";
import { historyStyles, historyGridRow, historyGridCell } from "../../style";

export function HistoryGrid({
  events,
  onPress,
  columns = 1,
}: HistoryGridProps) {
  if (columns <= 1) {
    // Single column mobile layout
    return (
      <View style={historyStyles.gridList} testID="history-grid">
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} onPress={onPress} history />
        ))}
      </View>
    );
  }

  // Multi-column desktop layout
  return (
    <View style={historyGridRow} testID="history-grid">
      {events.map((ev) => (
        <View key={ev.id} style={historyGridCell(columns)}>
          <EventCard event={ev} onPress={onPress} history />
        </View>
      ))}
    </View>
  );
}
