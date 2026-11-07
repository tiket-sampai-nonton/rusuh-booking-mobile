/**
 * History PageScreen —  Brutalist Mono "Arsip Event" (RBT-034).
 *
 * Dedicated `/history` route for PAST / CLOSED events.
 *
 *  Design (prototype 04-my-tickets):
 * - Black hero with large "ARSIP EVENT" title
 * - Header fixed at top
 * - EventCard grid in `history` (disabled) mode
 * - Grayscale images, 2px borders
 */
import { useRouter, type Href } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomNav, Header } from "@presentation/components/design-system";
import { createPrimaryNavLinks } from "@presentation/components/design-system/primary-navigation";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEvents } from "@presentation/hooks/useEvents";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useAccountStore } from "@presentation/stores/account-store";

import { HistoryGrid } from "./fragments/HistoryGrid";
import {
  HistoryEmpty,
  HistoryError,
  HistoryLoading,
} from "./fragments/HistoryStates";
import { historyStyles, historyScrollContent } from "./style";

export function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop, isMobileWeb, isNative, bottomBarHeight, gridColumns } =
    useResponsive();
  const profile = useAccountStore((state) => state.profile);
  const { data, isLoading, isError, error } = useEvents();

  const history = data?.history ?? [];

  // Past cards are disabled in EventCard (history mode) — this is a no-op
  const noop = (): void => undefined;
  let historyContent = (
    <HistoryGrid events={history} onPress={noop} columns={gridColumns} />
  );
  if (isLoading) {
    historyContent = <HistoryLoading />;
  } else if (isError) {
    historyContent = <HistoryError message={error?.message} />;
  } else if (history.length === 0) {
    historyContent = <HistoryEmpty />;
  }
  const goHome = (): void => router.push("/" as Href);
  const goBrowse = (): void => router.push("/browse" as Href);
  const navLinks = createPrimaryNavLinks({
    onHome: goHome,
    onBrowse: goBrowse,
    onTickets: () => router.push("/my-tickets" as Href),
    onProfile: () => router.push("/profile" as Href),
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

        <ScrollView
          contentContainerStyle={historyScrollContent(
            insets.bottom + (isNative ? bottomBarHeight : 0),
            isDesktop,
          )}
          testID="history-scroll"
        >
          {/*  Hero section — black bg with title */}
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
                Event yang sudah berlalu. Kartu diredam & tidak bisa diklik.
              </Text>
            </View>
          </View>

          {/* Main content */}
          <View
            style={[
              historyStyles.main,
              isMobileWeb && historyStyles.mobileWebMain,
            ]}
          >
            <Text style={historyStyles.sectionTitle}>Riwayat</Text>

            {historyContent}
          </View>
        </ScrollView>
        <BottomNav
          activeRoute={null}
          isLoggedIn={Boolean(profile)}
          onNavigate={(route) => {
            if (route === "home") goHome();
            else if (route === "browse") goBrowse();
            else if (route === "tickets") {
              router.push("/my-tickets" as Href);
            } else if (route === "profile") {
              router.push("/profile" as Href);
            }
          }}
        />
      </View>
    </ScreenFade>
  );
}
