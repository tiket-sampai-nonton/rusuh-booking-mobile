import { Text, View } from 'react-native';
import { EventCard, Reveal } from '@presentation/components/design-system';
import type { EventSummary } from '@domain/repositories/event.repository';
import { styles } from "./style";
import { gridItemStyle } from './style';


interface EventsGridProps {
  readonly events: readonly EventSummary[];
  readonly onPress: (eventId: string) => void;
  readonly columns: 1 | 2 | 3;
  readonly history?: boolean;
}

export function EventsGrid({ events, onPress, columns, history = false }: EventsGridProps) {
  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyLabel}>Belum ada event yang cocok.</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {events.map((event, index) => (
        <View key={event.id} style={gridItemStyle(index, events.length, columns)}>
          <Reveal delay={index * 80}>
            <EventCard event={event} onPress={onPress} history={history} />
          </Reveal>
        </View>
      ))}
    </View>
  );
}
