/**
 * History results grid — past/CLOSED events with V2EventCard.
 *
 * V2 Brutalist design:
 * - Ink background with 2px gap creates border effect
 * - Single column (mobile) or multi-column (desktop)
 * - V2EventCard in `history` mode (dimmed, disabled)
 */
import { View } from "react-native";

import { V2EventCard } from "@presentation/components/v2/V2EventCard";

import type { HistoryGridProps } from "../interface";
import { historyStyles, historyGridRow, historyGridCell } from "../style";

export function HistoryGrid({ events, onPress, columns = 1 }: HistoryGridProps) {
  if (columns <= 1) {
    // Single column mobile layout
    return (
      <View style={historyStyles.gridList} testID="history-grid">
        {events.map((ev) => (
          <V2EventCard
            key={ev.id}
            event={ev}
            onPress={onPress}
            history
          />
        ))}
      </View>
    );
  }

  // Multi-column desktop layout
  return (
    <View style={historyGridRow} testID="history-grid">
      {events.map((ev) => (
        <View key={ev.id} style={historyGridCell(columns)}>
          <V2EventCard
            event={ev}
            onPress={onPress}
            history
          />
        </View>
      ))}
    </View>
  );
}
