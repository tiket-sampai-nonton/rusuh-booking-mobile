/**
 * History PageScreen — V2 Brutalist Mono "Arsip Event" (RBT-034).
 *
 * Dedicated `/history` route for PAST / CLOSED events.
 *
 * V2 Design (prototype 04-my-tickets):
 * - Black hero with large "ARSIP EVENT" title
 * - V2Header fixed at top
 * - V2EventCard grid in `history` (disabled) mode
 * - Grayscale images, 2px borders
 */
import { useRouter, type Href } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { V2Header } from "@presentation/components/v2/V2Header";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEvents } from "@presentation/hooks/useEvents";
import { useResponsive } from "@presentation/hooks/useResponsive";

import { HistoryGrid } from "./fragments/HistoryGrid";
import { HistoryEmpty, HistoryError, HistoryLoading } from "./fragments/HistoryStates";
import { historyStyles, historyScrollContent } from "./style";

export function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop, gridColumns } = useResponsive();
  const { data, isLoading, isError, error } = useEvents();

  const history = data?.history ?? [];

  // Past cards are disabled in V2EventCard (history mode) — this is a no-op
  const noop = (): void => undefined;
  const goHome = (): void => router.push("/" as Href);
  const goBrowse = (): void => router.push("/browse" as Href);

  // Nav links for desktop header
  const navLinks = isDesktop
    ? [
        { label: "Browse", onPress: goBrowse, testID: "history-nav-browse" },
        { label: "Tiket Saya", onPress: noop, testID: "history-nav-tickets" },
      ]
    : [];

  return (
    <ScreenFade>
      <View style={historyStyles.container}>
        {/* V2 Header — fixed at top */}
        <V2Header
          topInset={insets.top}
          showLinks={isDesktop}
          links={navLinks}
          onLogoPress={goHome}
          ctaLabel="Masuk / Daftar"
        />

        <ScrollView
          contentContainerStyle={historyScrollContent(insets.bottom, isDesktop)}
          testID="history-scroll"
        >
          {/* V2 Hero section — black bg with title */}
          <View style={historyStyles.hero}>
            <View style={historyStyles.heroContent}>
              <Text style={historyStyles.heroTitle} accessibilityRole="header">
                Arsip Event
              </Text>
              <Text style={historyStyles.heroSubtitle}>
                Event yang sudah berlalu. Kartu diredam & tidak bisa diklik.
              </Text>
            </View>
          </View>

          {/* Main content */}
          <View style={historyStyles.main}>
            <Text style={historyStyles.sectionTitle}>⏳ Histori</Text>

            {isLoading ? (
              <HistoryLoading />
            ) : isError ? (
              <HistoryError message={error?.message} />
            ) : history.length === 0 ? (
              <HistoryEmpty />
            ) : (
              <HistoryGrid events={history} onPress={noop} columns={gridColumns} />
            )}
          </View>
        </ScrollView>
      </View>
    </ScreenFade>
  );
}
