/**
 * Browse PageScreen — parent component (orchestration only) — RBT-031.
 *
 * 1:1 of the prototype `browse.html` (filtered results page) — the page Home's
 * "Filter Event" popup redirects to on "Terapkan Filter". The URL query string
 * is the single source of truth: genre/time/sort are read from
 * `useLocalSearchParams`, so loading /browse?genre=rock&time=..&sort=.. hydrates
 * the UI straight from the URL (deep-linkable + back/forward safe). Applying a
 * filter re-navigates (`router.replace`) with the updated query rather than
 * holding filter state in the component, keeping the URL authoritative.
 *
 * Filtering is client-side (filter.ts — O4 open blocker). Markup → ./fragments,
 * styles → ./style, types → ./interface, filter logic → ./filter (refactor rule).
 */
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  FilterModal,
  type FilterValue,
} from "@presentation/components/FilterModal";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEvents } from "@presentation/hooks/useEvents";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { v2 } from "@presentation/theme";

import { BrowseChips } from "./fragments/BrowseChips";
import { BrowseGrid } from "./fragments/BrowseGrid";
import { BrowseEmpty, BrowseLoading } from "./fragments/BrowseStates";
import { BrowseTopBar } from "./fragments/BrowseTopBar";
import {
  SORTS,
  TIMES,
  filterEvents,
  isFiltered as computeIsFiltered,
  readGenre,
  readParam,
} from "./filter";
import { browseScrollContent } from "./style";

export function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop, gridColumns } = useResponsive();
  const params = useLocalSearchParams<{
    genre?: string;
    time?: string;
    sort?: string;
  }>();
  const { data, isLoading } = useEvents();
  const [refineOpen, setRefineOpen] = useState(false);

  // Hydrate the active filter straight from the (user-controlled) URL query.
  const genre = readGenre(params.genre);
  const time = readParam(params.time, TIMES, "all");
  const sort = readParam(params.sort, SORTS, "closest");

  // Only upcoming events are eligible — past ones live in Home's History.
  const results = useMemo(
    () => filterEvents(data?.upcoming ?? [], genre, time, sort, Date.now()),
    [data, genre, time, sort],
  );

  const goToEvent = (eventId: string): void =>
    router.push(`/events/${eventId}` as Href);
  const goHome = (): void => router.push("/" as Href);

  // Applying a filter updates the URL (the UI re-derives from the new query).
  const navWithFilter = (f: FilterValue): void => {
    setRefineOpen(false);
    const qs = new URLSearchParams({
      genre: f.genre,
      time: f.time,
      sort: f.sort,
    }).toString();
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
          {/* Brutalist inked tag + uppercase title (prototype 05 .page-head). */}
          <View
            style={{
              alignSelf: "flex-start",
              borderWidth: 2,
              borderColor: v2.ink,
              backgroundColor: v2.ink,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text
              accessibilityRole="header"
              style={{ color: v2.ground, letterSpacing: 2 }}
              className="text-2xs font-v2 font-bold uppercase"
            >
              ● Hasil Filter
            </Text>
          </View>
          <Text
            style={{ color: v2.ink, letterSpacing: -0.5, marginTop: 14 }}
            className="text-3xl font-v2 font-black uppercase"
          >
            Event Terfilter
          </Text>
          <Text style={{ color: v2.muted, marginTop: 8 }} className="text-base font-v2">
            Menampilkan event mendatang sesuai filter yang kamu pilih.
          </Text>

          <BrowseChips
            genre={genre}
            time={time}
            sort={sort}
            isFiltered={computeIsFiltered(genre, time, sort)}
            onRefine={() => setRefineOpen(true)}
            onReset={resetFilter}
          />

          <Text
            style={{ color: v2.ink, letterSpacing: 1, marginTop: 18 }}
            className="text-xs font-v2 font-bold uppercase"
            testID="browse-count"
          >
            {isLoading ? "Memuat…" : `${results.length} event ditemukan`}
          </Text>

          {isLoading ? (
            <BrowseLoading />
          ) : results.length === 0 ? (
            <BrowseEmpty />
          ) : (
            <BrowseGrid
              events={results}
              onPress={goToEvent}
              columns={gridColumns}
            />
          )}
        </ScrollView>

        <FilterModal
          visible={refineOpen}
          onClose={() => setRefineOpen(false)}
          onApply={navWithFilter}
        />
      </View>
    </ScreenFade>
  );
}
