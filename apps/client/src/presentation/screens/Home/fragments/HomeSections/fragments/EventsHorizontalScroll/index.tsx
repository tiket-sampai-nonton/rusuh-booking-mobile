import { useCallback, useRef, useState } from "react";
import { FlatList, Text, View, type ListRenderItemInfo } from "react-native";
import { EventCard, Reveal } from "@presentation/components/design-system";
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
  const [visibleIds, setVisibleIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      readonly viewableItems: readonly { item: EventSummary }[];
    }) => {
      setVisibleIds(new Set(viewableItems.map(({ item }) => item.id)));
    },
  ).current;
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<EventSummary>) => (
      <View style={styles.card}>
        <Reveal delay={index * 80}>
          <EventCard
            event={item}
            onPress={onPress}
            isImageVisible={visibleIds.has(item.id)}
          />
        </Reveal>
      </View>
    ),
    [onPress, visibleIds],
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
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 65 }}
      initialNumToRender={3}
      showsHorizontalScrollIndicator={false}
      snapToInterval={280 + 16}
      decelerationRate="fast"
      contentContainerStyle={styles.content}
      style={styles.list}
    />
  );
}
