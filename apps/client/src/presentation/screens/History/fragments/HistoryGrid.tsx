/**
 * History results grid — past/CLOSED events in `history` (disabled) mode.
 * Single column (phone) or multi-column (desktop web), mirroring Browse/Home.
 */
import { View } from "react-native";

import { EventCard } from "@presentation/components/EventCard";

import type { HistoryGridProps } from "../interface";
import { historyGridCell, historyGridRow, historyStyles } from "../style";

export function HistoryGrid({ events, onPress, columns = 1 }: HistoryGridProps) {
  if (columns <= 1) {
    return (
      <View style={historyStyles.gridList} testID="history-grid">
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} onPress={onPress} history />
        ))}
      </View>
    );
  }
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
