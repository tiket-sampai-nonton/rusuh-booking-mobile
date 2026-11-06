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

import { Header } from "@presentation/components/design-system/Header";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEvents } from "@presentation/hooks/useEvents";
import { useResponsive } from "@presentation/hooks/useResponsive";

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
  const { isDesktop, isMobileWeb, gridColumns } = useResponsive();
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

  // Nav links for desktop header
  const navLinks = [
    { label: "Beranda", onPress: goHome, testID: "history-nav-home" },
    { label: "Jelajahi", onPress: goBrowse, testID: "history-nav-browse" },
    { label: "Tiket Saya", onPress: noop, testID: "history-nav-tickets" },
    { label: "Arsip Event", onPress: noop, testID: "history-nav-archive" },
  ];

  return (
    <ScreenFade>
      <View style={historyStyles.container}>
        {/*  Header — fixed at top */}
        <Header
          topInset={insets.top}
          showLinks={isDesktop}
          links={navLinks}
          mobileMenuLinks={[
            { label: "Beranda", onPress: goHome, testID: "nav-home" },
            { label: "Cari Event", onPress: goBrowse, testID: "nav-browse" },
            {
              label: "Tiket Saya",
              onPress: () => router.push("/my-tickets" as Href),
              testID: "nav-tickets",
            },
            { label: "Arsip Event", onPress: () => {}, testID: "nav-history" },
            {
              label: "Profil",
              onPress: () => router.push("/profile" as Href),
              testID: "nav-profile",
            },
          ]}
          onLogoPress={goHome}
          ctaLabel="Masuk / Daftar"
        />

        <ScrollView
          contentContainerStyle={historyScrollContent(insets.bottom, isDesktop)}
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
      </View>
    </ScreenFade>
  );
}
