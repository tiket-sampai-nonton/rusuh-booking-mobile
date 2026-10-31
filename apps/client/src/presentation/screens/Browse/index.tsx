/**
 * Browse PageScreen — parent component (orchestration only).
 *
 * 1:1 of the prototype `browse.html` (filtered results page). The page the Home
 * "Filter Event" popup redirects to on "Terapkan Filter". Reads genre/time/sort
 * from the URL, filters the catalog client-side (filter.ts, O4 open blocker),
 * and composes the fragments. Markup → ./fragments, styles → ./style, types →
 * ./interface, filter logic → ./filter (presentation refactor rule).
 */
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FilterModal, type FilterValue } from "@presentation/components/FilterModal";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEvents } from "@presentation/hooks/useEvents";
import { useResponsive } from "@presentation/hooks/useResponsive";

import { BrowseChips } from "./fragments/BrowseChips";
import { BrowseGrid } from "./fragments/BrowseGrid";
import { BrowseEmpty, BrowseLoading } from "./fragments/BrowseStates";
import { BrowseTopBar } from "./fragments/BrowseTopBar";
import {
  GENRES,
  SORTS,
  TIMES,
  filterEvents,
  isFiltered as computeIsFiltered,
  readParam,
} from "./filter";
import { browseScrollContent } from "./style";

export function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop, gridColumns } = useResponsive();
  const params = useLocalSearchParams<{ genre?: string; time?: string; sort?: string }>();
  const { data, isLoading } = useEvents();
  const [refineOpen, setRefineOpen] = useState(false);

  const genre = readParam(params.genre, GENRES, "Semua");
  const time = readParam(params.time, TIMES, "all");
  const sort = readParam(params.sort, SORTS, "closest");

  const results = useMemo(
    () => filterEvents(data?.upcoming ?? [], genre, time, sort, Date.now()),
    [data, genre, time, sort],
  );

  const goToEvent = (eventId: string): void => router.push(`/events/${eventId}` as Href);
  const goHome = (): void => router.push("/" as Href);

  const navWithFilter = (f: FilterValue): void => {
    setRefineOpen(false);
    const qs = new URLSearchParams({ genre: f.genre, time: f.time, sort: f.sort }).toString();
    router.replace(`/browse?${qs}` as Href);
  };
  const resetFilter = (): void => router.replace("/browse" as Href);

  return (
    <ScreenFade>
      <View className="flex-1 bg-background">
        <BrowseTopBar onHome={goHome} />

        <ScrollView
          contentContainerStyle={browseScrollContent(insets.bottom, isDesktop)}
          testID="browse-scroll"
        >
          <Text className="text-sm font-semibold text-foreground" testID="browse-count">
            {isLoading ? "Memuat…" : `${results.length} event ditemukan`}
          </Text>

          <BrowseChips
            genre={genre}
            time={time}
            sort={sort}
            isFiltered={computeIsFiltered(genre, time, sort)}
            onRefine={() => setRefineOpen(true)}
            onReset={resetFilter}
          />

          {isLoading ? (
            <BrowseLoading />
          ) : results.length === 0 ? (
            <BrowseEmpty />
          ) : (
            <BrowseGrid events={results} onPress={goToEvent} columns={gridColumns} />
          )}
        </ScrollView>

        <FilterModal visible={refineOpen} onClose={() => setRefineOpen(false)} onApply={navWithFilter} />
      </View>
    </ScreenFade>
  );
}
