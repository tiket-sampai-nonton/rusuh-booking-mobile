/**
 * RBT-096 — V2 Brutalist Mono Home Screen (Re-implementation)
 *
 * 1:1 of prototype 01-home.html. MASTER-SPEC §3.1.
 *
 * PROTOTYPE RULES (non-negotiable):
 * - All images: grayscale(100%) by default, color pops on hover
 * - Hero: full viewport, Ken Burns zoom, glitch on slide change
 * - Cards: 3D tilt hover, badge slides from left
 * - Grid: 2px gap creates border effect (ink background)
 * - Header: slides in from top, fixed position
 * - All animations exactly as prototype
 */
import { useRouter, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginModal } from '@presentation/components/auth/LoginModal';
import { FilterModal, type FilterValue } from '@presentation/components/FilterModal';
import {
  V2ToastProvider,
  V2Loader,
  V2ScrollProgress,
  V2Header,
  V2HeroCarousel,
  V2BottomNav,
} from '@presentation/components/v2';
import { useEvents } from '@presentation/hooks/useEvents';
import { useResponsive } from '@presentation/hooks/useResponsive';
import { v2Colors } from '@presentation/theme';

import { V2HomeSections } from './fragments/V2HomeSections';
import { HomeError } from './fragments/HomeStates';

export function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useEvents();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const featuredY = useRef(0);
  const historyY = useRef(0);
  const { isWeb, isDesktop, isNative, width, gridColumns, bottomBarHeight } = useResponsive();
  const insets = useSafeAreaInsets();

  // Prototype breakpoint: nav center links show > 768px (desktop web only).
  const showNavLinks = isWeb && width > 768;

  // Bottom padding: account for bottom nav on native
  const bottomPadding = isNative ? bottomBarHeight + insets.bottom : insets.bottom;

  // Scroll offset drives the hero parallax + scroll progress.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // Modals (prototype: CTA → login modal; Filter → filter popup).
  const [loginOpen, setLoginOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const goToEvent = (eventId: string): void => router.push(`/events/${eventId}` as Href);
  const goBrowse = (): void => router.push('/browse' as Href);
  const scrollToFeatured = (): void =>
    scrollRef.current?.scrollTo({ y: featuredY.current, animated: true });
  const scrollToHistory = (): void =>
    scrollRef.current?.scrollTo({ y: historyY.current, animated: true });

  // Filter "Terapkan" → /browse with the chosen params.
  const applyFilter = (f: FilterValue): void => {
    setFilterOpen(false);
    const qs = new URLSearchParams({ genre: f.genre, time: f.time, sort: f.sort }).toString();
    router.push(`/browse?${qs}` as Href);
  };

  // Show loading screen (prototype loader with bouncing letters)
  if (isLoading) {
    return <V2Loader visible label="RUSUH" />;
  }

  return (
    <V2ToastProvider>
      <View style={{ flex: 1, backgroundColor: v2Colors.ground }}>
        {/* Scroll progress bar - fixed top (prototype .scroll-progress) */}
        {isWeb && <V2ScrollProgress />}

        <Animated.ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          testID="home-scroll"
        >
          {isError && <HomeError message={error?.message} />}

          {/* Hero Carousel - Full viewport (prototype .hero) */}
          {data && data.upcoming.length > 0 && (
            <V2HeroCarousel
              events={data.upcoming}
              onBook={goToEvent}
              onSeeAll={goBrowse}
            />
          )}

          {/* Main sections: Events grid, Categories, Stats, How-to, Testimonials, Newsletter, Footer */}
          {data && (
            <V2HomeSections
              data={data}
              isDesktop={isDesktop}
              columns={gridColumns}
              onPressEvent={goToEvent}
              onFilter={() => setFilterOpen(true)}
              onSeeAll={goBrowse}
              onFeaturedLayout={(y) => {
                featuredY.current = y;
              }}
              onHistoryLayout={(y) => {
                historyY.current = y;
              }}
            />
          )}
        </Animated.ScrollView>

        {/* Fixed Header - slides in from top (prototype .header) */}
        <V2Header
          topInset={insets.top}
          showLinks={showNavLinks}
          links={[
            { label: 'Konser', onPress: scrollToFeatured, testID: 'nav-konser' },
            { label: 'Festival', onPress: scrollToFeatured, testID: 'nav-festival' },
            { label: 'Olahraga', onPress: scrollToFeatured, testID: 'nav-olahraga' },
            { label: 'Theater', onPress: scrollToHistory, testID: 'nav-theater' },
          ]}
          onCtaPress={() => setLoginOpen(true)}
          onLogoPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        />

        {/* Login/OTP + Filter modals */}
        <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />
        <FilterModal visible={filterOpen} onClose={() => setFilterOpen(false)} onApply={applyFilter} />

        {/* Bottom Navigation (native only, handled internally by V2BottomNav) */}
        <V2BottomNav
          activeRoute="home"
          onNavigate={(route) => {
            if (route === 'browse') router.push('/browse' as Href);
            else if (route === 'tickets') router.push('/my-tickets' as Href);
            else if (route === 'profile') router.push('/profile' as Href);
            // home = current screen, no-op
          }}
        />
      </View>
    </V2ToastProvider>
  );
}
