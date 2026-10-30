/**
 * HomeScreen — event catalog (RBT-030, E4).
 *
 * Wiring: screen → useEvents (TanStack hook) → ListEvents use case →
 * EventRepository port → mock adapter. Renders two sections — "Konser Terdekat"
 * (upcoming) and "History Event" (past) — with status badges, price-from, and
 * date, matching the prototype `index.html`. Loading skeleton + empty state +
 * error state are all handled (AC2 defensive null-checks).
 */
import { useRouter, type Href } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { EventCard } from "@presentation/components/EventCard";
import { useEvents } from "@presentation/hooks/useEvents";

export function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useEvents();

  const goToEvent = (eventId: string): void => {
    // Typed-routes codegen under-enumerates dynamic paths in this project state,
    // so the concrete href is built and typed through `Href`. Runtime-correct.
    router.push(`/events/${eventId}` as Href);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingTop: 48 }}
      testID="home-scroll"
    >
      <Text
        className="text-3xl font-extrabold text-foreground"
        accessibilityRole="header"
      >
        Rusuh Booking Tiket
      </Text>
      <Text className="mt-1.5 text-base text-muted-foreground">
        Pilih event, masuk waiting room, amankan tiketmu. Tanpa PHP.
      </Text>

      {isLoading ? (
        <View className="mt-7.5 items-center" testID="home-loading">
          <ActivityIndicator accessibilityLabel="Memuat daftar event" />
          <Text className="mt-2 text-sm text-muted-foreground">
            Memuat event…
          </Text>
        </View>
      ) : null}

      {isError ? (
        <View
          className="mt-7.5 rounded-2xl border border-line p-6"
          testID="home-error"
          accessibilityLiveRegion="polite"
        >
          <Text className="text-base font-bold text-error">
            Gagal memuat event
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            {/* `||` (not `??`) so an empty message also shows the fallback. */}
            {error?.message || "Terjadi kesalahan. Silakan coba lagi."}
          </Text>
        </View>
      ) : null}

      {data ? (
        <>
          <Section
            title="Konser Terdekat"
            emptyText="Belum ada event mendatang."
            events={data.upcoming}
            onPress={goToEvent}
            testID="section-upcoming"
          />
          <Section
            title="History Event"
            emptyText="Belum ada event yang berlalu."
            events={data.history}
            onPress={goToEvent}
            history
            testID="section-history"
          />
        </>
      ) : null}
    </ScrollView>
  );
}

interface SectionProps {
  readonly title: string;
  readonly emptyText: string;
  readonly events: readonly import("@domain/repositories/event.repository").EventSummary[];
  readonly onPress: (eventId: string) => void;
  readonly history?: boolean;
  readonly testID: string;
}

function Section({
  title,
  emptyText,
  events,
  onPress,
  history = false,
  testID,
}: SectionProps) {
  return (
    <View className="mt-7.5" testID={testID}>
      <Text
        className="text-2xl font-extrabold text-foreground"
        accessibilityRole="header"
      >
        {title}
      </Text>
      {events.length === 0 ? (
        <View className="mt-3.5 rounded-2xl border border-dashed border-line p-6">
          <Text className="text-center text-sm text-muted-foreground">
            {emptyText}
          </Text>
        </View>
      ) : (
        <View className="mt-3.5 gap-3.5">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onPress={onPress}
              history={history}
            />
          ))}
        </View>
      )}
    </View>
  );
}
