/**
 * Home catalog sections: "Konser Terdekat" (featured + Filter button) and
 * "History Event" (archive), inside the desktop-centered container. Prototype
 * index.html #featured / #history.
 */
import { Pressable, Text, View } from "react-native";

import { HomeFooter } from "@presentation/components/home/HomeFooter";
import { Reveal } from "@presentation/components/home/Reveal";
import { SectionHead } from "@presentation/components/home/SectionHead";

import { CardGrid } from "./CardGrid";
import type { HomeSectionsProps } from "../interface";
import { homeContainer, homeStyles } from "../style";

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
      {/* Featured section — "Konser Terdekat". */}
      <View
        style={homeStyles.sectionFeatured}
        onLayout={(e) => onFeaturedLayout(e.nativeEvent.layout.y)}
        testID="section-upcoming"
      >
        <Reveal>
          <SectionHead
            tag="● Sedang Berlangsung"
            title="Konser Terdekat"
            subtitle="Pilih event, masuk waiting room, dan amankan tiketmu. Posisi antrean real-time, tanpa PHP."
          />
        </Reveal>

        <Reveal delay={80}>
          <View className="mb-7.5 flex-row">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filter Event"
              onPress={onFilter}
              testID="filter-open"
              style={homeStyles.filterBtn}
              className="flex-row items-center gap-2.5 rounded-pill border border-line bg-card shadow-filter"
            >
              <Text className="text-lg text-ink" accessibilityElementsHidden>⛃</Text>
              <Text style={homeStyles.navLinkText} className="font-bold text-ink">Filter Event</Text>
            </Pressable>
          </View>
        </Reveal>

        <CardGrid
          events={data.upcoming}
          onPress={onPressEvent}
          columns={columns}
          emptyText="Belum ada event yang cocok."
        />
      </View>

      {/* History section — "History Event". */}
      <View
        style={homeStyles.sectionHistory}
        onLayout={(e) => onHistoryLayout(e.nativeEvent.layout.y)}
        testID="section-history"
      >
        <Reveal>
          <SectionHead
            archive
            tag="⏳ Arsip"
            title="History Event"
            subtitle="Event yang sudah berlalu. Kartu diredam & tidak bisa diklik."
          />
        </Reveal>
        <CardGrid
          events={data.history}
          onPress={onPressEvent}
          history
          columns={columns}
          emptyText="Belum ada event yang berlalu."
        />
      </View>

      <HomeFooter />
    </View>
  );
}
