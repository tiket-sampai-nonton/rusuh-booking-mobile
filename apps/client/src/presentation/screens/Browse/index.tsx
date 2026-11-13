/**
 * Browse screen: owns route state, filters, and navigation; screen-specific UI
 * regions are composed from fragments in this directory.
 */
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  Platform,
  type ListRenderItemInfo,
  type StyleProp,
  type ViewStyle,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomNav,
  navigateBottomTab,
  Header,
  ToastProvider,
  EventCard,
} from "@presentation/components";
import { createPrimaryNavLinks } from "@presentation/components/primary-navigation";
import {
  FilterModal,
  type FilterValue,
} from "@presentation/components/FilterModal";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useEvents } from "@presentation/hooks/useEvents";
import { useAccountStore } from "@presentation/stores/account-store";
import { useServices } from "@providers/service-context";
import type { EventSummary } from "@domain/repositories/event.repository";
import { apiErrorMessage } from "@presentation/utils/api-error-message";
import { designColors, designSpacingSemantic } from "@presentation/theme";
import { gridItemStyle as homeGridItemStyle } from "../Home/fragments/HomeSections/fragments/EventsGrid/style";

import { BrowseCategoriesSection } from "./fragments/BrowseCategoriesSection";
import { BrowseEmpty, BrowseLoading } from "./fragments/BrowseStates";
import { BrowseHero } from "./fragments/BrowseHero";
import { BrowseNativeCategoryBar } from "./fragments/BrowseNativeCategoryBar";
import { BrowseResultsToolbar } from "./fragments/BrowseResultsToolbar";
import {
  readBrowseCategory,
  type BrowseCategoryKey,
} from "./fragments/categories";
import {
  filterEvents,
  matchesCategory,
  readGenre,
  readParam,
  SORTS,
  TIMES,
} from "./filter";
import {
  BROWSE_NATIVE_CATEGORY_BAR_HEIGHT,
  browseMain,
  browseNativeGridRowInset,
  browseNativeListItem,
  browseNativeMain,
  browseNativeScrollContent,
  browseRoot,
  browseScrollContent,
  browseGridCell,
  browseGridList,
  browseGridRow,
} from "./style";

function MobileWebEventSeparator() {
  return <View style={{ height: 8 }} />;
}

interface BrowseEventRenderContext {
  readonly viewMode: "grid" | "list";
  readonly isNative: boolean;
  readonly isMobileWeb: boolean;
  readonly isTabletWeb: boolean;
  readonly columns: BrowseColumns;
  readonly eventCount: number;
  readonly onPress: (eventId: string) => void;
}

type BrowseColumns = 1 | 2 | 3;

function browseEventItemStyle(
  index: number,
  context: BrowseEventRenderContext,
): StyleProp<ViewStyle> {
  if (context.isNative) {
    if (context.columns === 1) {
      return [
        browseGridList(context.isNative, context.isMobileWeb),
        browseNativeListItem,
        { marginBottom: 16 },
      ];
    }
    return browseGridCell(context.columns, context.isNative);
  }
  if (context.isMobileWeb) {
    return [
      homeGridItemStyle(index, context.eventCount, context.columns, true),
      { paddingHorizontal: 16 },
    ];
  }
  if (context.viewMode === "list") {
    return [
      browseGridList(context.isNative, context.isMobileWeb),
      context.isTabletWeb
        ? {
            alignSelf: "stretch",
            marginHorizontal: designSpacingSemantic.m,
            marginBottom: 16,
          }
        : { width: "100%", marginBottom: 16 },
    ];
  }
  return homeGridItemStyle(
    index,
    context.eventCount,
    context.columns,
    false,
    true,
  );
}

function renderBrowseEvent(
  { item, index }: ListRenderItemInfo<EventSummary>,
  context: BrowseEventRenderContext,
) {
  return (
    <View style={browseEventItemStyle(index, context)}>
      <EventCard
        event={item}
        onPress={context.onPress}
        listMode={context.viewMode === "list"}
      />
    </View>
  );
}

function isTabletWebViewport(isWeb: boolean, width: number): boolean {
  return isWeb && width > 640 && width < 960;
}

function hasActiveBrowseFilters(
  category: BrowseCategoryKey | null,
  genre: string,
  time: string,
  sort: string,
): boolean {
  return (
    (category !== null && category !== "all") ||
    genre !== "Semua" ||
    time !== "all" ||
    sort !== "closest"
  );
}

function browseTimeframe(time: string): "THIS_WEEK" | "THIS_MONTH" | undefined {
  if (time === "week") return "THIS_WEEK";
  if (time === "month") return "THIS_MONTH";
  return undefined;
}

function browseEventQuery(genre: string, time: string, sort: string) {
  const timeframe = browseTimeframe(time);
  return {
    ...(genre !== "Semua" ? { genres: [genre] } : {}),
    ...(timeframe ? { timeframe } : {}),
    sort: sort === "furthest" ? ("DATE_DESC" as const) : ("DATE_ASC" as const),
  };
}

function browseColumnWrapper(
  columns: number,
  isNative: boolean,
): StyleProp<ViewStyle> | undefined {
  if (columns <= 1) return undefined;
  if (isNative) return [browseGridRow(isNative), browseNativeGridRowInset];
  return { flexDirection: "row", marginHorizontal: designSpacingSemantic.m };
}

function browseListContentStyle(
  bottomInset: number,
  isDesktop: boolean,
  isMobileWeb: boolean,
  isNative: boolean,
  topInset: number,
  resultCount: number,
) {
  return [
    browseScrollContent(bottomInset, isDesktop, isMobileWeb),
    isNative &&
      browseNativeScrollContent(
        topInset + 56 + BROWSE_NATIVE_CATEGORY_BAR_HEIGHT + 12,
      ),
    resultCount === 0 && { flexGrow: 1 },
  ];
}

interface BrowseListHeaderProps {
  readonly topInset: number;
  readonly isNative: boolean;
  readonly isDesktop: boolean;
  readonly isMobileWeb: boolean;
  readonly activeCategory: BrowseCategoryKey | null;
  readonly time: string;
  readonly sort: string;
  readonly isFiltered: boolean;
  readonly onSelectCategory: (category: BrowseCategoryKey | null) => void;
  readonly onReset: () => void;
  readonly isError: boolean;
  readonly error: unknown;
  readonly isFetching: boolean;
  readonly retryLabel: string;
  readonly onRetry: () => void;
  readonly count: number;
  readonly viewMode: "grid" | "list";
  readonly onFilterPress: () => void;
  readonly onSortChange: (sort: string) => void;
  readonly onViewModeChange: (mode: "grid" | "list") => void;
}

function BrowseListHeader({
  topInset,
  isNative,
  isDesktop,
  isMobileWeb,
  activeCategory,
  time,
  sort,
  isFiltered,
  onSelectCategory,
  onReset,
  isError,
  error,
  isFetching,
  retryLabel,
  onRetry,
  count,
  viewMode,
  onFilterPress,
  onSortChange,
  onViewModeChange,
}: BrowseListHeaderProps) {
  return (
    <>
      {!isNative ? (
        <BrowseHero
          topInset={topInset}
          isDesktop={isDesktop}
          isMobileWeb={isMobileWeb}
        />
      ) : null}
      {!isNative ? (
        <BrowseCategoriesSection
          activeCategory={activeCategory}
          isDesktop={isDesktop}
          isMobileWeb={isMobileWeb}
          time={time}
          sort={sort}
          isFiltered={isFiltered}
          onSelect={onSelectCategory}
          onReset={onReset}
        />
      ) : null}
      {isError && count > 0 ? (
        <View
          testID="browse-stale-data-error"
          accessibilityLiveRegion="polite"
          style={{
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <Text style={{ textAlign: "center", marginBottom: 8 }}>
            {apiErrorMessage(error)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Coba muat event lagi"
            accessibilityState={{ disabled: isFetching }}
            disabled={isFetching}
            onPress={onRetry}
            testID="browse-retry-stale"
            style={{
              borderWidth: 2,
              borderColor: designColors.ink,
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontWeight: "700" }}>{retryLabel}</Text>
          </Pressable>
        </View>
      ) : null}
      <View
        style={isNative ? browseNativeMain : browseMain(isDesktop, isMobileWeb)}
      >
        <BrowseResultsToolbar
          count={count}
          isNative={isNative}
          sortBy={sort}
          viewMode={viewMode}
          isMobileWeb={isMobileWeb}
          onFilterPress={onFilterPress}
          onSortChange={onSortChange}
          onViewModeChange={onViewModeChange}
        />
      </View>
    </>
  );
}

interface BrowseListEmptyProps {
  readonly isNative: boolean;
  readonly isDesktop: boolean;
  readonly isMobileWeb: boolean;
  readonly isError: boolean;
  readonly error: unknown;
  readonly isFetching: boolean;
  readonly retryLabel: string;
  readonly onRetry: () => void;
}

function BrowseListEmpty({
  isNative,
  isDesktop,
  isMobileWeb,
  isError,
  error,
  isFetching,
  retryLabel,
  onRetry,
}: BrowseListEmptyProps) {
  return (
    <View
      style={isNative ? browseNativeMain : browseMain(isDesktop, isMobileWeb)}
    >
      {isError ? (
        <View
          testID="browse-error"
          accessibilityLiveRegion="polite"
          style={{ alignItems: "center", paddingVertical: 32 }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>
            Event gagal dimuat
          </Text>
          <Text style={{ textAlign: "center", marginBottom: 16 }}>
            {apiErrorMessage(error)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Coba muat event lagi"
            accessibilityState={{ disabled: isFetching }}
            disabled={isFetching}
            onPress={onRetry}
            testID="browse-retry"
            style={{
              borderWidth: 2,
              borderColor: designColors.ink,
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontWeight: "700" }}>{retryLabel}</Text>
          </Pressable>
        </View>
      ) : (
        <BrowseEmpty />
      )}
    </View>
  );
}

export function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isWeb, isDesktop, isNative, isMobileWeb, width, gridColumns } =
    useResponsive();
  const isTabletWeb = isTabletWebViewport(isWeb, width);
  const params = useLocalSearchParams<{
    category?: string;
    genre?: string;
    time?: string;
    sort?: string;
  }>();
  const profile = useAccountStore((state) => state.profile);
  const { serverClock, eventRepository } = useServices();
  const showNavLinks = isWeb && width > 768;

  const [activeCategory, setActiveCategory] =
    useState<BrowseCategoryKey | null>(
      () =>
        readBrowseCategory(params.category) ?? readBrowseCategory(params.genre),
    );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const genre = readGenre(params.genre);
  useEffect(() => {
    setActiveCategory(
      readBrowseCategory(params.category) ?? readBrowseCategory(params.genre),
    );
  }, [params.category, params.genre]);
  const time = readParam(params.time, TIMES, "all");
  const sort = readParam(params.sort, SORTS, "closest");
  const isFiltered = hasActiveBrowseFilters(activeCategory, genre, time, sort);
  const eventQuery = browseEventQuery(genre, time, sort);
  const {
    data,
    isLoading,
    isError,
    error,
    refetch: retryEvents,
    isFetching,
  } = useEvents(eventQuery);
  const allResults = useMemo(
    () =>
      filterEvents(
        data?.upcoming ?? [],
        eventRepository.supportsServerFilters ? "Semua" : genre,
        eventRepository.supportsServerFilters && time !== "quarter"
          ? "all"
          : time,
        sort,
        serverClock.serverNow(),
      ),
    [
      data,
      genre,
      time,
      sort,
      serverClock,
      eventRepository.supportsServerFilters,
    ],
  );
  const results = useMemo(() => {
    if (!activeCategory || activeCategory === "all") return allResults;
    return allResults.filter((event) => matchesCategory(event, activeCategory));
  }, [activeCategory, allResults]);
  const goToEvent = useCallback(
    (eventId: string): void => router.push(`/events/${eventId}` as Href),
    [router],
  );
  const goHome = (): void => router.navigate("/" as Href);
  const navLinks = createPrimaryNavLinks({
    onHome: goHome,
    onBrowse: () => undefined,
    onTickets: () => router.navigate("/my-tickets" as Href),
    onProfile: () => router.navigate("/profile" as Href),
    isLoggedIn: Boolean(profile),
  });
  const applyFilter = (value: FilterValue): void => {
    setFilterOpen(false);
    setActiveCategory(readBrowseCategory(value.category));
    const query = new URLSearchParams({
      category: value.category,
      time: value.time,
      sort: value.sort,
    }).toString();
    router.replace(`/browse?${query}` as Href);
  };

  const changeSort = (value: string): void => {
    const query = new URLSearchParams({
      ...(activeCategory ? { category: activeCategory } : {}),
      ...(genre !== "Semua" ? { genre } : {}),
      time,
      sort: value,
    }).toString();
    router.replace(`/browse?${query}` as Href);
  };

  const resetFilters = (): void => {
    setActiveCategory("all");
    router.replace("/browse" as Href);
  };

  const columns = browseGridColumnCount(
    viewMode,
    isNative,
    gridColumns,
    isMobileWeb,
  );
  const retryLabel = isFetching ? "Memuat…" : "Coba Lagi";
  const renderEvent = useCallback(
    (info: ListRenderItemInfo<EventSummary>) =>
      renderBrowseEvent(info, {
        viewMode,
        isNative,
        isMobileWeb,
        isTabletWeb,
        columns,
        eventCount: results.length,
        onPress: goToEvent,
      }),
    [
      columns,
      goToEvent,
      isMobileWeb,
      isNative,
      isTabletWeb,
      results.length,
      viewMode,
    ],
  );
  if (isLoading) return <BrowseLoading />;

  const columnWrapperStyle = browseColumnWrapper(columns, isNative);

  const header = (
    <BrowseListHeader
      topInset={insets.top}
      isNative={isNative}
      isDesktop={isDesktop}
      isMobileWeb={isMobileWeb}
      activeCategory={activeCategory}
      time={time}
      sort={sort}
      isFiltered={isFiltered}
      onSelectCategory={setActiveCategory}
      onReset={resetFilters}
      isError={isError}
      error={error}
      isFetching={isFetching}
      retryLabel={retryLabel}
      onRetry={() => void retryEvents()}
      count={results.length}
      viewMode={viewMode}
      onFilterPress={() => setFilterOpen(true)}
      onSortChange={changeSort}
      onViewModeChange={setViewMode}
    />
  );

  return (
    <ToastProvider>
      <View style={browseRoot}>
        <FlatList
          key={`browse-grid-${columns}`}
          data={results}
          keyExtractor={(event) => event.id}
          numColumns={columns}
          columnWrapperStyle={columnWrapperStyle}
          ItemSeparatorComponent={
            isMobileWeb ? MobileWebEventSeparator : undefined
          }
          contentContainerStyle={browseListContentStyle(
            insets.bottom,
            isDesktop,
            isMobileWeb,
            isNative,
            insets.top,
            results.length,
          )}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <BrowseListEmpty
              isNative={isNative}
              isDesktop={isDesktop}
              isMobileWeb={isMobileWeb}
              isError={isError}
              error={error}
              isFetching={isFetching}
              retryLabel={retryLabel}
              onRetry={() => void retryEvents()}
            />
          }
          initialNumToRender={Math.max(4, columns * 2)}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={50}
          windowSize={3}
          removeClippedSubviews={Platform.OS === "android"}
          renderItem={renderEvent}
          testID="browse-scroll"
        />

        <Header
          topInset={insets.top}
          showLinks={showNavLinks}
          isLoggedIn={Boolean(profile)}
          links={navLinks}
          mobileMenuLinks={navLinks}
          onLogoPress={goHome}
          actions={[]}
        />
        {isNative && (
          <BrowseNativeCategoryBar
            top={insets.top + 56}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            time={time}
            sort={sort}
            isFiltered={isFiltered}
            onReset={resetFilters}
          />
        )}
        <BottomNav
          activeRoute="browse"
          isLoggedIn={Boolean(profile)}
          onNavigate={(route) => navigateBottomTab(router, "browse", route)}
        />
        <FilterModal
          visible={filterOpen}
          value={{ category: activeCategory ?? "all", time, sort }}
          onClose={() => setFilterOpen(false)}
          onApply={applyFilter}
        />
      </View>
    </ToastProvider>
  );
}

function browseGridColumnCount(
  viewMode: "grid" | "list",
  isNative: boolean,
  responsiveColumns: 1 | 2 | 3,
  isMobileWeb = false,
): 1 | 2 | 3 {
  if (viewMode === "list") return 1;
  if (isNative) return 2;
  if (isMobileWeb) return 1;
  return responsiveColumns;
}

export default BrowseScreen;
