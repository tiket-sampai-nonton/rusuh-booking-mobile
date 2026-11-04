/**
 * V2 Brutalist Mono Home sections (RBT-088).
 *
 * Prototype 01-home `#featured` / `#history`: uppercase section headers with a
 * hard-bordered tag pill, a brutalist "Filter Event" button, and the event
 * grid. Pure black/white, 2px borders, no shadow. Reveal via V2Reveal (reduced-
 * motion safe). Same props/data wiring as the V5 version — restyle only.
 */
import { Pressable, Text, View } from "react-native";

import { HomeFooter } from "@presentation/components/home/HomeFooter";
import { V2Reveal } from "@presentation/components/v2";
import { v2 } from "@presentation/theme";

import { CardGrid } from "./CardGrid";
import { HomeMarketing } from "./HomeMarketing";
import type { HomeSectionsProps } from "../interface";
import { homeContainer, homeStyles } from "../style";

/** Brutalist section header: tag pill + uppercase title + muted subtitle. */
function V2SectionHead({
  tag,
  title,
  subtitle,
  archive = false,
}: {
  readonly tag: string;
  readonly title: string;
  readonly subtitle: string;
  readonly archive?: boolean;
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          alignSelf: "flex-start",
          borderWidth: 2,
          borderColor: v2.ink,
          backgroundColor: archive ? v2.field : v2.ink,
          paddingHorizontal: 12,
          paddingVertical: 6,
          marginBottom: 14,
        }}
      >
        <Text
          style={{ color: archive ? v2.ink : v2.ground, letterSpacing: 2 }}
          className="text-2xs font-v2 font-bold uppercase"
        >
          {tag}
        </Text>
      </View>
      <Text
        accessibilityRole="header"
        style={{ color: v2.ink, letterSpacing: -0.5 }}
        className="text-3xl font-v2 font-black uppercase"
      >
        {title}
      </Text>
      <Text style={{ color: v2.muted, marginTop: 8, lineHeight: 20 }} className="text-base font-v2">
        {subtitle}
      </Text>
    </View>
  );
}

export function HomeSections({
  data,
  isDesktop,
  columns,
  onPressEvent,
  onFilter,
  onFeaturedLayout,
  onHistoryLayout,
}: HomeSectionsProps) {
  return (
    <View style={homeContainer(isDesktop)}>
      <View
        style={homeStyles.sectionFeatured}
        onLayout={(e) => onFeaturedLayout(e.nativeEvent.layout.y)}
        testID="section-upcoming"
      >
        <V2Reveal>
          <V2SectionHead
            tag="Sedang Berlangsung"
            title="Konser Terdekat"
            subtitle="Pilih event, masuk ke ruang tunggu, dan amankan tiketmu. Posisi antrean diperbarui langsung."
          />
        </V2Reveal>

        <V2Reveal delay={80}>
          <View className="mb-7.5 flex-row">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Saring Event"
              onPress={onFilter}
              testID="filter-open"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                borderWidth: 2,
                borderColor: v2.ink,
                backgroundColor: v2.ground,
                paddingVertical: 13,
                paddingHorizontal: 22,
              }}
            >
              <Text style={{ color: v2.ink }} className="text-lg font-v2" accessibilityElementsHidden>
                ⛃
              </Text>
              <Text style={{ color: v2.ink }} className="text-sm font-v2 font-bold uppercase">
                Saring Event
              </Text>
            </Pressable>
          </View>
        </V2Reveal>

        <CardGrid
          events={data.upcoming}
          onPress={onPressEvent}
          columns={columns}
          emptyText="Belum ada event yang cocok."
        />
      </View>

      <View
        style={homeStyles.sectionHistory}
        onLayout={(e) => onHistoryLayout(e.nativeEvent.layout.y)}
        testID="section-history"
      >
        <V2Reveal>
          <V2SectionHead
            archive
            tag="⏳ Arsip"
            title="Riwayat Event"
            subtitle="Event yang sudah berlalu. Kartu diredam & tidak bisa diklik."
          />
        </V2Reveal>
        <CardGrid
          events={data.history}
          onPress={onPressEvent}
          history
          columns={columns}
          emptyText="Belum ada event yang berlalu."
        />
      </View>

      {/* Brutalist marketing sections (stats / how / testimonials / newsletter)
          are full-bleed, so they sit OUTSIDE the padded container. */}
      <HomeMarketing />

      <HomeFooter />
    </View>
  );
}
