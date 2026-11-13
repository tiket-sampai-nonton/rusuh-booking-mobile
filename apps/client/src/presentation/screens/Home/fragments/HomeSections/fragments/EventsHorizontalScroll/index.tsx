import { useCallback } from "react";
import { FlatList, Text, View, type ListRenderItemInfo } from "react-native";
import { EventCard } from "@presentation/components";
import type { EventSummary } from "@domain/repositories/event.repository";
import { styles } from "./style";

interface EventsHorizontalScrollProps {
  readonly events: readonly EventSummary[];
  readonly onPress: (eventId: string) => void;
}

export function EventsHorizontalScroll({
  events,
  onPress,
}: EventsHorizontalScrollProps) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<EventSummary>) => (
      <View style={styles.card}>
        <EventCard event={item} onPress={onPress} />
      </View>
    ),
    [onPress],
  );

  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyLabel}>Belum ada event yang cocok.</Text>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      // Avoid Android Fabric reattaching a clipped Reanimated card when the
      // preserved Home route updates underneath a modal or another route.
      removeClippedSubviews={false}
      initialNumToRender={3}
      showsHorizontalScrollIndicator={false}
      snapToInterval={280 + 16}
      decelerationRate="fast"
      contentContainerStyle={styles.content}
      style={styles.list}
    />
  );
}
