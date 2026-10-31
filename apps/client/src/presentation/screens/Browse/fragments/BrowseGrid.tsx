/** Browse results grid — single column (phone) or multi-column (desktop web). */
import { View } from "react-native";

import { EventCard } from "@presentation/components/EventCard";

import type { BrowseGridProps } from "../interface";
import { browseGridCell, browseGridRow, browseStyles } from "../style";

export function BrowseGrid({ events, onPress, columns = 1 }: BrowseGridProps) {
  if (columns <= 1) {
    return (
      <View style={browseStyles.gridList}>
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} onPress={onPress} />
        ))}
      </View>
    );
  }
  return (
    <View style={browseGridRow}>
      {events.map((ev) => (
        <View key={ev.id} style={browseGridCell(columns)}>
          <EventCard event={ev} onPress={onPress} />
        </View>
      ))}
    </View>
  );
}
