/**
 * Browse screen: owns route state, filters, and navigation; screen-specific UI
 * regions are composed from fragments in this directory.
 */
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomNav,
  Header,
  ToastProvider,
} from "@presentation/components/design-system";
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
import { BrowseGrid } from "./fragments/BrowseGrid";
import { BrowseHero } from "./fragments/BrowseHero";
import { BrowseLoadMore } from "./fragments/BrowseLoadMore";
import { BrowseNativeCategoryBar } from "./fragments/BrowseNativeCategoryBar";
import { BrowseResultsToolbar } from "./fragments/BrowseResultsToolbar";
import type { BrowseCategoryKey } from "./fragments/categories";
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
  browseScroll,
  browseScrollContent,
} from "./style";

export function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isWeb, isDesktop, isNative, isMobileWeb, width, gridColumns } =
    useResponsive();
  const params = useLocalSearchParams<{
    genre?: string;
    time?: string;
    sort?: string;
  }>();
  const profile = useAccountStore((state) => state.profile);
  const { serverClock } = useServices();
  const { data, isLoading } = useEvents();
  const showNavLinks = isWeb && width > 768;

  const [activeCategory, setActiveCategory] = useState<string>(() =>
    params.genre === "Semua" ? "all" : (params.genre ?? "all"),
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState(params.sort ?? "date");
  const [loadMoreDisabled, setLoadMoreDisabled] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const genre = readGenre(params.genre);
  const time = readParam(params.time, TIMES, "all");
  const sort = readParam(params.sort, SORTS, "closest");
  const allResults = useMemo(
    () =>
      filterEvents(
        data?.upcoming ?? [],
        genre,
        time,
        sort,
        serverClock.serverNow(),
      ),
    [data, genre, time, sort, serverClock],
  );
  const results = useMemo(() => {
    if (activeCategory === "all") return allResults;
    return allResults.filter((event) => matchesCategory(event, activeCategory));
  }, [activeCategory, allResults]);

  const goToEvent = (eventId: string): void =>
    router.push(`/events/${eventId}` as Href);
  const goHome = (): void => router.push("/" as Href);
  const applyFilter = (value: FilterValue): void => {
    setFilterOpen(false);
    const query = new URLSearchParams({
      genre: value.genre,
      time: value.time,
      sort: value.sort,
    }).toString();
    router.push(`/browse?${query}` as Href);
  };

  if (isLoading) return <BrowseLoading />;

  return (
    <ToastProvider>
      <View style={browseRoot}>
        <ScrollView
          style={browseScroll}
          contentContainerStyle={[
            browseScrollContent(insets.bottom, isDesktop, isMobileWeb),
            isNative && browseNativeScrollContent(insets.top + 56 + 52 + 12),
          ]}
          testID="browse-scroll"
        >
          {!isNative && (
            <BrowseHero
              topInset={insets.top}
              isDesktop={isDesktop}
              isMobileWeb={isMobileWeb}
            />
          )}
          {!isNative && (
            <BrowseCategoriesSection
              activeCategory={activeCategory as BrowseCategoryKey}
              isDesktop={isDesktop}
              isMobileWeb={isMobileWeb}
              onSelect={setActiveCategory}
            />
          )}

          <View
            style={
              isNative ? browseNativeMain : browseMain(isDesktop, isMobileWeb)
            }
          >
            <BrowseResultsToolbar
              count={results.length}
              isNative={isNative}
              sortBy={sortBy}
              viewMode={viewMode}
              isMobileWeb={isMobileWeb}
              onFilterPress={() => setFilterOpen(true)}
              onSortChange={setSortBy}
              onViewModeChange={setViewMode}
            />
            {results.length === 0 ? (
              <BrowseEmpty />
            ) : (
              <BrowseGrid
                events={results}
                onPress={goToEvent}
                columns={browseGridColumnCount(
                  viewMode,
                  isNative,
                  gridColumns,
                  isMobileWeb,
                )}
              />
            )}
            {!isNative && results.length > 0 && (
              <BrowseLoadMore
                disabled={loadMoreDisabled}
                onPress={() => setLoadMoreDisabled(true)}
              />
            )}
          </View>
        </ScrollView>

        <Header
          topInset={insets.top}
          showLinks={showNavLinks}
          isLoggedIn={Boolean(profile)}
          links={[
            { label: "Beranda", onPress: goHome, testID: "nav-home" },
            { label: "Jelajahi", onPress: () => {}, testID: "nav-browse" },
            ...(profile
              ? [
                  {
                    label: "Tiket Saya",
                    onPress: () => router.push("/my-tickets" as Href),
                    testID: "nav-tickets",
                  },
                  {
                    label: "Profil",
                    onPress: () => router.push("/profile" as Href),
                    testID: "nav-profile",
                  },
                ]
              : []),
          ]}
          mobileMenuLinks={[
            { label: "Beranda", onPress: goHome, testID: "nav-home" },
            { label: "Cari Event", onPress: () => {}, testID: "nav-browse" },
            {
              label: "Tiket Saya",
              onPress: () => router.push("/my-tickets" as Href),
              testID: "nav-tickets",
            },
            {
              label: "Arsip Event",
              onPress: () => router.push("/history" as Href),
              testID: "nav-history",
            },
            {
              label: "Profil",
              onPress: () => router.push("/profile" as Href),
              testID: "nav-profile",
            },
          ]}
          onLogoPress={goHome}
          actions={[]}
        />
        {isNative && (
          <BrowseNativeCategoryBar
            top={insets.top + 56}
            activeCategory={activeCategory as BrowseCategoryKey}
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
