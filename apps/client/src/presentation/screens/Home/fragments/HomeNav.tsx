/**
 * Floating glass nav (prototype .nav): brand + center links (web > 720px) +
 * "Masuk / Daftar" CTA. Links scroll in-page; the CTA opens the login modal.
 */
import { Pressable, Text, View } from "react-native";

import { BrandMark } from "@presentation/components/BrandMark";

import type { HomeNavProps } from "../interface";
import { homeNavPill, homeNavWrap, homeStyles } from "../style";

export function HomeNav({
  showLinks,
  width,
  topInset,
  onJelajah,
  onHistory,
  onKategori,
  onAccount,
}: HomeNavProps) {
  return (
    <View pointerEvents="box-none" style={homeNavWrap(topInset)}>
      <View
        style={homeNavPill(width)}
        className="flex-row items-center gap-[22px] rounded-pill border border-white/60 bg-card/80 shadow-filter"
      >
        <BrandMark />
        {showLinks ? (
          <View className="flex-row gap-1">
            {/* Prototype nav links are in-page anchors (scroll, no navigation). */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Jelajah event"
              testID="nav-jelajah"
              onPress={onJelajah}
              style={homeStyles.navLink}
              className="rounded-pill"
            >
              <Text style={homeStyles.navLinkText} className="font-semibold text-muted-foreground">Jelajah</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="History event"
              testID="nav-history"
              onPress={onHistory}
              style={homeStyles.navLink}
              className="rounded-pill"
            >
              <Text style={homeStyles.navLinkText} className="font-semibold text-muted-foreground">History</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kategori event"
              testID="nav-kategori"
              onPress={onKategori}
              style={homeStyles.navLink}
              className="rounded-pill"
            >
              <Text style={homeStyles.navLinkText} className="font-semibold text-muted-foreground">Kategori</Text>
            </Pressable>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Masuk atau Daftar"
          testID="nav-cta"
          onPress={onAccount}
          style={homeStyles.ctaInner}
          className="flex-row items-center gap-2.25 rounded-pill bg-ink"
        >
          <Text style={homeStyles.ctaText} className="font-bold text-white">Masuk / Daftar</Text>
          <View style={homeStyles.ctaPin} className="items-center justify-center rounded-full bg-brand">
            <Text style={homeStyles.ctaText} className="text-white" accessibilityElementsHidden>↗</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
