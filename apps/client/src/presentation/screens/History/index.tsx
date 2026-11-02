/**
 * History PageScreen — "History Event" (RBT-034).
 *
 * Dedicated `/history` route for PAST / CLOSED events. The upcoming/history
 * split is derived once in the application layer (ListEvents → splitCatalog) on
 * the SERVER clock (ServerClock), so a skewed device clock never miscategorises
 * an event; this screen simply reads `data.history` (already most-recent-first)
 * and renders it through the shared EventCard in `history` (disabled) mode.
 *
 * 1:1 of the prototype index.html #history section copy ("History Event" +
 * "⏳ Arsip"). Markup → ./fragments, styles → ./style, types → ./interface.
 */
import { useRouter, type Href } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SectionHead } from "@presentation/components/home/SectionHead";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEvents } from "@presentation/hooks/useEvents";
import { useResponsive } from "@presentation/hooks/useResponsive";

import { HistoryGrid } from "./fragments/HistoryGrid";
import { HistoryEmpty, HistoryLoading } from "./fragments/HistoryStates";
import { HistoryTopBar } from "./fragments/HistoryTopBar";
import { historyScrollContent } from "./style";

export function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop, gridColumns } = useResponsive();
  const { data, isLoading, isError, error } = useEvents();

  const history = data?.history ?? [];

  // Past cards are disabled in EventCard (history mode), so this never fires;
  // kept for the shared EventCard signature.
  const goToEvent = (eventId: string): void =>
    router.push(`/events/${eventId}` as Href);
  const goHome = (): void => router.push("/" as Href);

  return (
    <ScreenFade>
      <View className="flex-1 bg-background">
        <HistoryTopBar onHome={goHome} />

        <ScrollView
          contentContainerStyle={historyScrollContent(insets.bottom, isDesktop)}
          testID="history-scroll"
        >
          <SectionHead
            archive
            tag="⏳ Arsip"
            title="History Event"
            subtitle="Event yang sudah berlalu. Kartu diredam & tidak bisa diklik."
          />

          {isLoading ? (
            <HistoryLoading />
          ) : isError ? (
            <View
              className="mt-8 rounded-2xl border border-line p-6"
              testID="history-error"
              accessibilityLiveRegion="polite"
            >
              <Text className="text-base font-bold text-error">
                Gagal memuat event
              </Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                {error?.message || "Terjadi kesalahan. Silakan coba lagi."}
              </Text>
            </View>
          ) : history.length === 0 ? (
            <HistoryEmpty />
          ) : (
            <HistoryGrid
              events={history}
              onPress={goToEvent}
              columns={gridColumns}
            />
          )}
        </ScrollView>
      </View>
    </ScreenFade>
  );
}
