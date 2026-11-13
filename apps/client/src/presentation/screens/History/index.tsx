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
import { useState, type ReactNode } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  type ListRenderItemInfo,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomNav, Header, navigateBottomTab } from "@presentation/components";
import { createPrimaryNavLinks } from "@presentation/components/primary-navigation";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEvents } from "@presentation/hooks/useEvents";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useAccountStore } from "@presentation/stores/account-store";
import { EventCard } from "@presentation/components/EventCard";
import type { EventSummary } from "@domain/repositories/event.repository";
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

function historyColumns(
  viewMode: HistoryViewMode,
  isNative: boolean,
  gridColumns: number,
): number {
  if (viewMode === "list") return 1;
  return isNative ? 2 : gridColumns;
}

function historyColumnWrapper(
  columns: number,
  isNative: boolean,
): StyleProp<ViewStyle> | undefined {
  if (columns <= 1) return undefined;
  return isNative ? { flexDirection: "row" } : historyStyles.webGridRow;
}

function historyStateContent(
  isLoading: boolean,
  isError: boolean,
  error: unknown,
  retryEvents: () => unknown,
  isFetching: boolean,
  hasHistory: boolean,
): ReactNode {
  if (isLoading) return <HistoryLoading />;
  if (isError) {
    return (
      <HistoryError
        error={error}
        onRetry={() => void retryEvents()}
        isRetrying={isFetching}
      />
    );
  }
  return hasHistory ? null : <HistoryEmpty />;
}

interface HistoryCellStyleInput {
  readonly isNative: boolean;
  readonly isMobileWeb: boolean;
  readonly isListMode: boolean;
  readonly columns: number;
  readonly index: number;
  readonly length: number;
}

function historyCellStyle({
  isNative,
  isMobileWeb,
  isListMode,
  columns,
  index,
  length,
}: HistoryCellStyleInput): StyleProp<ViewStyle> {
  if (isNative) {
    return columns > 1
      ? historyStyles.nativeGridCell
      : historyStyles.nativeListCell;
  }
  if (isMobileWeb) {
    return [
      homeGridItemStyle(index, length, columns, true),
      historyStyles.mobileWebGridCell,
    ];
  }
  if (isListMode) return historyStyles.webListCell;
  return homeGridItemStyle(index, length, columns, false, true);
}

interface HistoryRenderContext
  extends Omit<HistoryCellStyleInput, "index" | "length"> {
  readonly historyLength: number;
  readonly router: ReturnType<typeof useRouter>;
}

function renderHistoryItem(
  { item, index }: ListRenderItemInfo<EventSummary>,
  context: HistoryRenderContext,
) {
  const cellStyle = historyCellStyle({
    ...context,
    index,
    length: context.historyLength,
  });
  return (
    <View style={cellStyle}>
      <EventCard
        event={item}
        onPress={(eventId) =>
          context.router.push(`/events/${eventId}?source=history` as Href)
        }
        history
        listMode={context.isListMode}
      />
    </View>
  );
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
  const columns = historyColumns(viewMode, isNative, gridColumns);

  const showEmptyState = isLoading || isError || history.length === 0;
  const columnWrapperStyle = historyColumnWrapper(columns, isNative);
  const historyState = historyStateContent(
    isLoading,
    isError,
    error,
    retryEvents,
    isFetching,
    history.length > 0,
  );
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
          columnWrapperStyle={columnWrapperStyle}
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
          renderItem={(info) =>
            renderHistoryItem(info, {
              isNative,
              isMobileWeb,
              isListMode: viewMode === "list",
              columns,
              historyLength: history.length,
              router,
            })
          }
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
