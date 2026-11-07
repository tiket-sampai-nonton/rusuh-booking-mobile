/**
 * Browse screen: owns route state, filters, and navigation; screen-specific UI
 * regions are composed from fragments in this directory.
 */
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomNav,
  Header,
  ToastProvider,
} from "@presentation/components/design-system";
import { createPrimaryNavLinks } from "@presentation/components/design-system/primary-navigation";
import {
  FilterModal,
  type FilterValue,
} from "@presentation/components/FilterModal";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useEvents } from "@presentation/hooks/useEvents";
import { useAccountStore } from "@presentation/stores/account-store";
import { useServices } from "@providers/service-context";

import { BrowseCategoriesSection } from "./fragments/BrowseCategoriesSection";
import { BrowseEmpty, BrowseLoading } from "./fragments/BrowseStates";
import { BrowseHero } from "./fragments/BrowseHero";
import { BrowseLoadMore } from "./fragments/BrowseLoadMore";
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
  browseMain,
  browseNativeMain,
  browseNativeScrollContent,
  browseRoot,
  browseScrollContent,
  browseGridCell,
  browseGridList,
  browseGridRow,
} from "./style";
import { EventCard } from "@presentation/components/design-system";

export function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isWeb, isDesktop, isNative, isMobileWeb, width, gridColumns } =
    useResponsive();
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
  const [loadMoreDisabled, setLoadMoreDisabled] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const genre = readGenre(params.genre);
  useEffect(() => {
    setActiveCategory(
      readBrowseCategory(params.category) ?? readBrowseCategory(params.genre),
    );
  }, [params.category, params.genre]);
  const time = readParam(params.time, TIMES, "all");
  const sort = readParam(params.sort, SORTS, "closest");
  const eventQuery = {
    ...(genre !== "Semua" ? { genres: [genre] } : {}),
    ...(time === "week"
      ? { timeframe: "THIS_WEEK" as const }
      : time === "month"
        ? { timeframe: "THIS_MONTH" as const }
        : {}),
    sort: sort === "furthest" ? ("DATE_DESC" as const) : ("DATE_ASC" as const),
  };
  const { data, isLoading } = useEvents(eventQuery);
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

  const goToEvent = (eventId: string): void =>
    router.push(`/events/${eventId}` as Href);
  const goHome = (): void => router.push("/" as Href);
  const navLinks = createPrimaryNavLinks({
    onHome: goHome,
    onBrowse: () => undefined,
    onTickets: () => router.push("/my-tickets" as Href),
    onProfile: () => router.push("/profile" as Href),
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
    router.push(`/browse?${query}` as Href);
  };

  const changeSort = (value: string): void => {
    const query = new URLSearchParams({
      ...(activeCategory ? { category: activeCategory } : {}),
      ...(genre !== "Semua" ? { genre } : {}),
      time,
      sort: value,
    }).toString();
    router.push(`/browse?${query}` as Href);
  };

  if (isLoading) return <BrowseLoading />;

  const columns = browseGridColumnCount(
    viewMode,
    isNative,
    gridColumns,
    isMobileWeb,
  );
  const header = (
    <>
      {!isNative && (
        <BrowseHero
          topInset={insets.top}
          isDesktop={isDesktop}
          isMobileWeb={isMobileWeb}
        />
      )}
      {!isNative && (
        <BrowseCategoriesSection
          activeCategory={activeCategory}
          isDesktop={isDesktop}
          isMobileWeb={isMobileWeb}
          onSelect={setActiveCategory}
        />
      )}
      <View
        style={isNative ? browseNativeMain : browseMain(isDesktop, isMobileWeb)}
      >
        <BrowseResultsToolbar
          count={results.length}
          isNative={isNative}
          sortBy={sort}
          viewMode={viewMode}
          isMobileWeb={isMobileWeb}
          onFilterPress={() => setFilterOpen(true)}
          onSortChange={changeSort}
          onViewModeChange={setViewMode}
        />
      </View>
    </>
  );

  return (
    <ToastProvider>
      <View style={browseRoot}>
        <FlatList
          key={`browse-grid-${columns}`}
          data={results}
          keyExtractor={(event) => event.id}
          numColumns={columns}
          columnWrapperStyle={columns > 1 ? browseGridRow(isNative) : undefined}
          contentContainerStyle={[
            browseScrollContent(insets.bottom, isDesktop, isMobileWeb),
            isNative && browseNativeScrollContent(insets.top + 56 + 52 + 12),
            results.length === 0 && { flexGrow: 1 },
          ]}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <View
              style={
                isNative ? browseNativeMain : browseMain(isDesktop, isMobileWeb)
              }
            >
              <BrowseEmpty />
            </View>
          }
          ListFooterComponent={
            !isNative && results.length > 0 ? (
              <BrowseLoadMore
                disabled={loadMoreDisabled}
                onPress={() => setLoadMoreDisabled(true)}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <View
              style={
                columns === 1
                  ? [
                      browseGridList(isNative, isMobileWeb),
                      { width: "100%", marginBottom: isMobileWeb ? 8 : 16 },
                    ]
                  : browseGridCell(columns, isNative)
              }
            >
              <EventCard
                event={item}
                onPress={goToEvent}
                listMode={columns === 1}
              />
            </View>
          )}
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
          />
        )}
        <BottomNav
          activeRoute="browse"
          isLoggedIn={Boolean(profile)}
          onNavigate={(route) => {
            if (route === "home") router.push("/" as Href);
            else if (route === "tickets") router.push("/my-tickets" as Href);
            else if (route === "profile") router.push("/profile" as Href);
          }}
        />
        <FilterModal
          visible={filterOpen}
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
