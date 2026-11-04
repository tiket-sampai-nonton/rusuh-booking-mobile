/**
 * RBT-089 — V2 Brutalist Mono Browse Screen
 *
 * PROTOTYPE 05-browse.html EXACT COPY:
 * - Header: fixed, white bg, 2px border, slides on scroll
 * - Hero: black bg with noise
 * - Categories: button grid with fill-up hover
 * - Cards: grayscale→color on hover, 8px shadow offset
 * - Load more: fill-up button
 * - View toggle: grid/list
 * - Sort select: date/price/popular
 *
 * URL query is single source of truth (deep-linkable).
 */
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useState, useRef } from 'react';
import { Pressable, ScrollView, Text, View, Platform } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  V2ToastProvider,
  V2Loader,
  V2Header,
  V2BottomNav,
} from '@presentation/components/v2';
import { useEvents } from '@presentation/hooks/useEvents';
import { useResponsive } from '@presentation/hooks/useResponsive';
import { FilterModal, type FilterValue } from '@presentation/components/FilterModal';
import { useAccountStore } from '@presentation/stores/account-store';
import { v2Colors, v2Borders, interFonts } from '@presentation/theme';

import { BrowseGrid } from './fragments/BrowseGrid';
import { BrowseEmpty } from './fragments/BrowseStates';
import {
  SORTS,
  TIMES,
  filterEvents,
  matchesCategory,
  readGenre,
  readParam,
} from './filter';
import {
  browseScrollContent,
  browseHero,
  browseCategories,
  browseCategoriesInner,
  browseCategoryBtn,
  browseCategoryBtnActive,
  browseMain,
  browseHeader,
  browseViewToggle,
  browseViewBtn,
  browseViewBtnActive,
  browseSortSelect,
  browseLoadMore,
  browseLoadMoreBtn,
} from './style';

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES (prototype .categories-grid)
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'concert', label: 'Concerts' },
  { key: 'festival', label: 'Festivals' },
  { key: 'sports', label: 'Sports' },
  { key: 'theater', label: 'Theater' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SORT OPTIONS (prototype .sort-select)
// ═══════════════════════════════════════════════════════════════════════════════

const SORT_OPTIONS = [
  { key: 'date', label: 'Sort by Date' },
  { key: 'price-low', label: 'Price: Low to High' },
  { key: 'price-high', label: 'Price: High to Low' },
  { key: 'popular', label: 'Most Popular' },
] as const;

export function BrowseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isWeb, isDesktop, isNative, width, gridColumns } = useResponsive();
  const params = useLocalSearchParams<{
    genre?: string;
    time?: string;
    sort?: string;
  }>();
  const profile = useAccountStore((s) => s.profile);
  const { data, isLoading } = useEvents();
  const scrollRef = useRef<Animated.ScrollView>(null);

  // Show nav links on desktop web (prototype: > 768px)
  const showNavLinks = isWeb && width > 768;

  // Scroll position for header animation
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // State
  const [activeCategory, setActiveCategory] = useState(params.genre ?? 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState(params.sort ?? 'date');
  const [loadMoreDisabled, setLoadMoreDisabled] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Hydrate filter from URL
  const genre = readGenre(params.genre);
  const time = readParam(params.time, TIMES, 'all');
  const sort = readParam(params.sort, SORTS, 'closest');

  // Filter results
  const allResults = useMemo(
    () => filterEvents(data?.upcoming ?? [], genre, time, sort, Date.now()),
    [data, genre, time, sort],
  );

  // Apply category filter
  const results = useMemo(() => {
    let filtered = allResults;

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter((ev) => matchesCategory(ev, activeCategory));
    }

    return filtered;
  }, [allResults, activeCategory]);

  const goToEvent = (eventId: string): void =>
    router.push(`/events/${eventId}` as Href);
  const goHome = (): void => router.push('/' as Href);
  const applyFilter = (value: FilterValue): void => {
    setFilterOpen(false);
    router.push(`/browse?${new URLSearchParams({ genre: value.genre, time: value.time, sort: value.sort }).toString()}` as Href);
  };

  // Handle category click
  const handleCategoryClick = (key: string) => {
    setActiveCategory(key);
  };

  // Handle load more
  const handleLoadMore = () => {
    setLoadMoreDisabled(true);
  };

  // Show loading screen
  if (isLoading) {
    return <V2Loader visible label="BROWSE" />;
  }

  return (
    <V2ToastProvider>
      <View style={{ flex: 1, backgroundColor: v2Colors.ground }}>
        <Animated.ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[
            browseScrollContent(insets.bottom, isDesktop),
            isNative && { paddingTop: insets.top + 56 + 68 + 52 },
          ]}
          stickyHeaderIndices={undefined}
          testID="browse-scroll"
        >
          {/* ═══════════════════════════════════════════════════════════════════
              HERO SECTION (prototype .hero)
              ═══════════════════════════════════════════════════════════════════ */}
          {!isNative && <View style={[browseHero, { paddingTop: insets.top + 80 }]}>
            {/* Hero title with slide-up animation */}
            <View style={{ marginBottom: 24 }}>
              <Text
                accessibilityRole="header"
                style={{
                  color: v2Colors.ground,
                  fontSize: isDesktop ? 80 : 40,
                  fontFamily: interFonts.black,
                  letterSpacing: -0.04 * (isDesktop ? 80 : 40),
                  lineHeight: isDesktop ? 72 : 36,
                  textAlign: 'center',
                }}
              >
                Find Your
              </Text>
              <Text
                style={{
                  color: v2Colors.ground,
                  fontSize: isDesktop ? 80 : 40,
                  fontFamily: interFonts.black,
                  letterSpacing: -0.04 * (isDesktop ? 80 : 40),
                  lineHeight: isDesktop ? 72 : 36,
                  textAlign: 'center',
                }}
              >
                Next Event
              </Text>
            </View>
          </View>}

          {/* ═══════════════════════════════════════════════════════════════════
              CATEGORIES SECTION (prototype .categories)
              Mobile: horizontal scroll with pill buttons (no header)
              Desktop: grid with section header
              ═══════════════════════════════════════════════════════════════════ */}
          {isNative ? null : (
            // Desktop: grid categories with header
            <View style={browseCategories}>
              <View style={browseCategoriesInner(isDesktop)}>
                {/* Header */}
                <View style={{ marginBottom: 32 }}>
                  <Text
                    style={{
                      color: v2Colors.ink,
                      fontSize: 24,
                      fontFamily: interFonts.black,
                      textTransform: 'uppercase',
                      letterSpacing: -0.48,
                    }}
                  >
                    Categories
                  </Text>
                </View>

                {/* Category buttons grid */}
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.key;
                    return (
                      <Pressable
                        key={cat.key}
                        style={isActive ? browseCategoryBtnActive : browseCategoryBtn}
                        onPress={() => handleCategoryClick(cat.key)}
                        testID={`category-${cat.key}`}
                      >
                        <Text
                          style={{
                            color: isActive ? v2Colors.ground : v2Colors.ink,
                            fontFamily: interFonts.bold,
                            fontSize: 14,
                            textTransform: 'uppercase',
                          }}
                        >
                          {cat.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              MAIN CONTENT (prototype main)
              ═══════════════════════════════════════════════════════════════════ */}
          <View style={isNative ? { paddingHorizontal: 16 } : browseMain(isDesktop)}>
            {/* Browse header: results count, sort, view toggle */}
            <View
              style={[
                browseHeader,
                isNative && {
                  marginBottom: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 0,
                  borderBottomWidth: 1,
                  borderBottomColor: v2Colors.ink,
                  borderStyle: 'dashed',
                },
              ]}
            >
              <Text
                style={{
                  color: v2Colors.inkMuted,
                  fontFamily: interFonts.regular,
                  fontSize: 14,
                }}
                testID="browse-count"
              >
                Showing{' '}
                <Text style={{ color: v2Colors.ink, fontFamily: interFonts.bold }}>
                  {results.length}
                </Text>{' '}
                events
              </Text>

              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                <Pressable accessibilityRole="button" accessibilityLabel="Filter event" onPress={() => setFilterOpen(true)} style={{ minHeight: 36, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: v2Colors.ink }} testID="browse-filter">
                  <Text style={{ color: v2Colors.ink, fontFamily: interFonts.bold, fontSize: 11, textTransform: 'uppercase' }}>Filter</Text>
                </Pressable>
                {/* The mobile prototype has no sort control; retain it only on web. */}
                {Platform.OS === 'web' ? (
                  <View style={browseSortSelect}>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 14,
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </View>
                ) : null}

                {/* View toggle (prototype .view-toggle) */}
                <View style={browseViewToggle}>
                  <Pressable
                    style={[
                      viewMode === 'grid' ? browseViewBtnActive : browseViewBtn,
                      isNative && { width: 36, height: 36, paddingVertical: 0, paddingHorizontal: 0, alignItems: 'center', justifyContent: 'center' },
                    ]}
                    onPress={() => setViewMode('grid')}
                    testID="view-grid"
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={viewMode === 'grid' ? v2Colors.ground : v2Colors.ink} strokeWidth={2}>
                      <Path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
                    </Svg>
                  </Pressable>
                  <View style={{ width: v2Borders.standard, backgroundColor: v2Colors.ink }} />
                  <Pressable
                    style={[
                      viewMode === 'list' ? browseViewBtnActive : browseViewBtn,
                      isNative && { width: 36, height: 36, paddingVertical: 0, paddingHorizontal: 0, alignItems: 'center', justifyContent: 'center' },
                    ]}
                    onPress={() => setViewMode('list')}
                    testID="view-list"
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={viewMode === 'list' ? v2Colors.ground : v2Colors.ink} strokeWidth={2}>
                      <Path d="M4 5h16M4 12h16M4 19h16" />
                    </Svg>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Events grid or empty state */}
            {results.length === 0 ? (
              <BrowseEmpty />
            ) : (
              <BrowseGrid
                events={results}
                onPress={goToEvent}
                columns={viewMode === 'list' ? 1 : (isNative ? 2 : gridColumns)}
              />
            )}

            {/* Load more button (prototype .load-more) */}
            {!isNative && results.length > 0 && (
              <View style={browseLoadMore}>
                <Pressable
                  style={({ pressed }) => [
                    browseLoadMoreBtn,
                    pressed && { backgroundColor: v2Colors.ink },
                    loadMoreDisabled && { opacity: 0.5 },
                  ]}
                  onPress={handleLoadMore}
                  disabled={loadMoreDisabled}
                  testID="load-more-btn"
                >
                  <Text
                    style={{
                      color: loadMoreDisabled ? v2Colors.inkMuted : v2Colors.ink,
                      fontFamily: interFonts.bold,
                      fontSize: 14,
                      textTransform: 'uppercase',
                    }}
                  >
                    {loadMoreDisabled ? 'No More Events' : 'Load More Events'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </Animated.ScrollView>

        {/* Fixed Header (prototype header) */}
        <V2Header
          topInset={insets.top}
          showLinks={showNavLinks}
          isLoggedIn={Boolean(profile)}
          links={[
            { label: 'Beranda', onPress: goHome, testID: 'nav-home' },
            { label: 'Browse', onPress: () => {}, testID: 'nav-browse' },
            ...(profile ? [
              { label: 'My Ticket', onPress: () => router.push('/my-tickets' as Href), testID: 'nav-tickets' },
              { label: 'Profile', onPress: () => router.push('/profile' as Href), testID: 'nav-profile' },
            ] : []),
          ]}
          onCtaPress={() => {}}
          onLogoPress={goHome}
          actions={[]}
        />

        {isNative && (
            <View
              style={{
                position: 'absolute',
                top: insets.top + 56,
                left: 0,
                right: 0,
                zIndex: 98,
                height: 52,
                backgroundColor: v2Colors.ground,
                borderBottomWidth: 2,
                borderBottomColor: v2Colors.ink,
              }}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
                {CATEGORIES.map((cat) => {
                  const active = activeCategory === cat.key;
                  return (
                    <Pressable
                      key={cat.key}
                      onPress={() => handleCategoryClick(cat.key)}
                      style={{ paddingHorizontal: 16, minHeight: 34, justifyContent: 'center', borderWidth: 2, borderColor: v2Colors.ink, backgroundColor: active ? v2Colors.ink : v2Colors.ground }}
                      testID={`category-${cat.key}`}
                    >
                      <Text style={{ color: active ? v2Colors.ground : v2Colors.ink, fontFamily: interFonts.semiBold, fontSize: 12, textTransform: 'uppercase' }}>{cat.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
        )}

        {/* Bottom Navigation (native only, handled internally by V2BottomNav) */}
        <V2BottomNav
          activeRoute="browse"
          isLoggedIn={Boolean(profile)}
          onNavigate={(route) => {
            if (route === 'home') router.push('/' as Href);
            else if (route === 'browse') { /* already here */ }
            else if (route === 'tickets') router.push('/my-tickets' as Href);
            else if (route === 'profile') router.push('/profile' as Href);
          }}
        />
        <FilterModal visible={filterOpen} onClose={() => setFilterOpen(false)} onApply={applyFilter} />
      </View>
    </V2ToastProvider>
  );
}
