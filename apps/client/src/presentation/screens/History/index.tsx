/**
 * History PageScreen —  Brutalist Mono "Arsip Event" (RBT-034).
 *
 * Dedicated `/history` route for PAST / CLOSED events.
 *
 *  Design (prototype 04-my-tickets):
 * - Black hero with large "ARSIP EVENT" title
 * - Header fixed at top
 * - EventCard grid in `history` (dimmed, navigable) mode
 * - Grayscale images, 2px borders
 */
import { useRouter, type Href } from "expo-router";
import { FlatList, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomNav,
  Header,
  navigateBottomTab,
} from "@presentation/components/design-system";
import { createPrimaryNavLinks } from "@presentation/components/design-system/primary-navigation";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEvents } from "@presentation/hooks/useEvents";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useAccountStore } from "@presentation/stores/account-store";

import {
  HistoryEmpty,
  HistoryError,
  HistoryLoading,
} from "./fragments/HistoryStates";
import {
  historyStyles,
  historyGridCell,
  historyGridRow,
  historyGridSingleCell,
  historyListContent,
} from "./style";
import { EventCard } from "@presentation/components/design-system/EventCard";

export function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop, isMobileWeb, isNative, bottomBarHeight, gridColumns } =
    useResponsive();
  const profile = useAccountStore((state) => state.profile);
  const {
    data,
    isLoading,
    isError,
    error,
    refetch: retryEvents,
    isFetching,
  } = useEvents();

  const history = data?.history ?? [];

  const showEmptyState = isLoading || isError || history.length === 0;
  const historyState = isLoading ? (
    <HistoryLoading />
  ) : isError ? (
    <HistoryError
      error={error}
      onRetry={() => void retryEvents()}
      isRetrying={isFetching}
    />
  ) : history.length === 0 ? (
    <HistoryEmpty />
  ) : null;
  const goHome = (): void => router.navigate("/" as Href);
  const goBrowse = (): void => router.navigate("/browse" as Href);
  const navLinks = createPrimaryNavLinks({
    onHome: goHome,
    onBrowse: goBrowse,
    onTickets: () => router.navigate("/my-tickets" as Href),
    onProfile: () => router.navigate("/profile" as Href),
    isLoggedIn: Boolean(profile),
  });

  return (
    <ScreenFade>
      <View style={historyStyles.container}>
        {/*  Header — fixed at top */}
        <Header
          topInset={insets.top}
          showLinks={isDesktop}
          links={navLinks}
          mobileMenuLinks={navLinks}
          onLogoPress={goHome}
          ctaLabel="Masuk / Daftar"
          isLoggedIn={Boolean(profile)}
        />

        <FlatList
          key={`history-grid-${gridColumns}`}
          data={showEmptyState ? [] : history}
          keyExtractor={(event) => event.id}
          numColumns={gridColumns}
          columnWrapperStyle={gridColumns > 1 ? historyGridRow : undefined}
          contentContainerStyle={historyListContent(
            insets.bottom + (isNative ? bottomBarHeight : 0),
            isDesktop,
          )}
          ListHeaderComponent={
            <>
              <View
                style={[
                  historyStyles.hero,
                  isMobileWeb && historyStyles.mobileWebHero,
                ]}
              >
                <View style={historyStyles.heroContent}>
                  <Text
                    style={[
                      historyStyles.heroTitle,
                      isMobileWeb && historyStyles.mobileWebHeroTitle,
                    ]}
                    accessibilityRole="header"
                  >
                    Arsip Event
                  </Text>
                  <Text
                    style={[
                      historyStyles.heroSubtitle,
                      isMobileWeb && historyStyles.mobileWebHeroSubtitle,
                    ]}
                  >
                    Event yang sudah berlalu. Pilih kartu untuk melihat detail.
                  </Text>
                </View>
              </View>
              <View
                style={[
                  historyStyles.main,
                  isMobileWeb && historyStyles.mobileWebMain,
                ]}
              >
                <Text style={historyStyles.sectionTitle}>Riwayat</Text>
                {historyState}
              </View>
            </>
          }
          initialNumToRender={Math.max(4, gridColumns * 2)}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
          renderItem={({ item }) => (
            <View
              style={
                gridColumns > 1
                  ? historyGridCell
                  : historyGridSingleCell(isMobileWeb)
              }
            >
              <EventCard
                event={item}
                onPress={(eventId) =>
                  router.push(`/events/${eventId}?source=history` as Href)
                }
                history
              />
            </View>
          )}
          testID="history-grid"
        />
        <BottomNav
          activeRoute={null}
          isLoggedIn={Boolean(profile)}
          onNavigate={(route) => navigateBottomTab(router, null, route)}
        />
      </View>
    </ScreenFade>
  );
}
