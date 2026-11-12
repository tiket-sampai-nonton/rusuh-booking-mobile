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
import { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from "react-native";
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
import { EventCard } from "@presentation/components/design-system/EventCard";
import { gridItemStyle as homeGridItemStyle } from "../Home/fragments/HomeSections/fragments/EventsGrid/style";
import { GridIcon } from "../Browse/fragments/BrowseResultsToolbar/icons/GridIcon";
import { ListIcon } from "../Browse/fragments/BrowseResultsToolbar/icons/ListIcon";

import {
  HistoryEmpty,
  HistoryError,
  HistoryLoading,
} from "./fragments/HistoryStates";
import { historyStyles, historyListContent } from "./style";

type HistoryViewMode = "grid" | "list";

function MobileWebEventSeparator() {
  return <View style={{ height: 8 }} />;
}

export function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop, isMobileWeb, isNative, bottomBarHeight, gridColumns } =
    useResponsive();
  const [viewMode, setViewMode] = useState<HistoryViewMode>("grid");
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
  const columns = viewMode === "list" ? 1 : isNative ? 2 : gridColumns;

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
          key={`history-grid-${columns}`}
          data={showEmptyState ? [] : history}
          keyExtractor={(event) => event.id}
          numColumns={columns}
          columnWrapperStyle={
            columns > 1
              ? isNative
                ? { flexDirection: "row" }
                : historyStyles.webGridRow
              : undefined
          }
          ItemSeparatorComponent={
            isMobileWeb ? MobileWebEventSeparator : undefined
          }
          contentContainerStyle={historyListContent(
            insets.bottom + (isNative ? bottomBarHeight : 0),
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
                <HistoryResultsToolbar
                  count={history.length}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  showViewModeToggle={!isMobileWeb}
                />
                {historyState}
              </View>
            </>
          }
          initialNumToRender={Math.max(4, columns * 2)}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
          renderItem={({ item, index }) => {
            const isListMode = viewMode === "list";
            const cellStyle: StyleProp<ViewStyle> = isNative
              ? columns > 1
                ? historyStyles.nativeGridCell
                : historyStyles.nativeListCell
              : isMobileWeb
                ? [
                    homeGridItemStyle(index, history.length, columns, true),
                    historyStyles.mobileWebGridCell,
                  ]
                : isListMode
                  ? historyStyles.webListCell
                  : homeGridItemStyle(
                      index,
                      history.length,
                      columns,
                      false,
                      true,
                    );

            return (
              <View style={cellStyle}>
                <EventCard
                  event={item}
                  onPress={(eventId) =>
                    router.push(`/events/${eventId}?source=history` as Href)
                  }
                  history
                  listMode={isListMode}
                />
              </View>
            );
          }}
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

interface HistoryResultsToolbarProps {
  readonly count: number;
  readonly viewMode: HistoryViewMode;
  readonly onViewModeChange: (mode: HistoryViewMode) => void;
  readonly showViewModeToggle: boolean;
}

function HistoryResultsToolbar({
  count,
  viewMode,
  onViewModeChange,
  showViewModeToggle,
}: HistoryResultsToolbarProps) {
  return (
    <View style={historyStyles.resultsToolbar}>
      <Text style={historyStyles.resultsCount} testID="history-count">
        Menampilkan <Text style={historyStyles.resultsCountValue}>{count}</Text>{" "}
        event
      </Text>
      {showViewModeToggle ? (
        <View style={historyStyles.viewToggle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tampilan grid"
            accessibilityState={{ selected: viewMode === "grid" }}
            onPress={() => onViewModeChange("grid")}
            style={[
              historyStyles.viewButton,
              viewMode === "grid" && historyStyles.viewButtonActive,
            ]}
            testID="history-view-grid"
          >
            <GridIcon active={viewMode === "grid"} />
          </Pressable>
          <View style={historyStyles.viewDivider} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tampilan satu kolom"
            accessibilityState={{ selected: viewMode === "list" }}
            onPress={() => onViewModeChange("list")}
            style={[
              historyStyles.viewButton,
              viewMode === "list" && historyStyles.viewButtonActive,
            ]}
            testID="history-view-list"
          >
            <ListIcon active={viewMode === "list"} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
