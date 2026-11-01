/**
 * Event card grid. Native/phone → one column (prototype mobile). On desktop web
 * it becomes the prototype's multi-column grid via a flex-wrap row where each
 * card takes `100/N %` minus the gap. Each card reveals with a stagger.
 */
import { Text, View } from "react-native";

import { EventCard } from "@presentation/components/EventCard";
import { Reveal } from "@presentation/components/home/Reveal";

import type { CardGridProps } from "../interface";
import { homeGridCell, homeStyles } from "../style";

export function CardGrid({ events, onPress, history = false, emptyText, columns = 1 }: CardGridProps) {
  if (events.length === 0) {
    return (
      <View style={homeStyles.emptyGrid}>
        <Text className="text-center text-sm text-muted-foreground">{emptyText}</Text>
      </View>
    );
  }
  if (columns <= 1) {
    return (
      <View style={homeStyles.gridList}>
        {events.map((ev, i) => (
          <Reveal key={ev.id} delay={i * 60}>
            <EventCard event={ev} onPress={onPress} history={history} />
          </Reveal>
        ))}
      </View>
    );
  }
  return (
    <View style={homeStyles.gridRow}>
      {events.map((ev, i) => (
        <View key={ev.id} style={homeGridCell(columns)}>
          <Reveal delay={i * 60}>
            <EventCard event={ev} onPress={onPress} history={history} />
          </Reveal>
        </View>
      ))}
    </View>
  );
}
