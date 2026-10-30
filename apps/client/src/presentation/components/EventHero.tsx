/**
 * EventHero — full-bleed photo hero (prototype index.html `.hero`).
 *
 * Shows the top upcoming event over its concert photo with a dark scrim, the
 * "LIVE · FLASH SALE" eyebrow, the event title, 📍/🗓 meta, and the
 * "Booking Sekarang" + "Lihat Semua" actions. A row of dots reflects the top-3
 * (static — the prototype's auto-rotation is decorative and respects reduced
 * motion; a static hero is the reduced-motion-safe 1:1 of its layout).
 */
import { ImageBackground, Pressable, Text, View } from "react-native";

import type { EventSummary } from "@domain/repositories/event.repository";
import { eventImage } from "@domain/rules/event-image";
import { formatDateID } from "@domain/services/date-format";

export interface EventHeroProps {
  /** Upcoming events; the first is featured, up to 3 dots shown. */
  readonly events: readonly EventSummary[];
  readonly onBook: (eventId: string) => void;
  readonly onSeeAll: () => void;
}

export function EventHero({ events, onBook, onSeeAll }: EventHeroProps) {
  const top = events.slice(0, 3);
  const featured = top[0];
  if (!featured) return null;

  const image = eventImage(featured.id);
  const dateTxt = formatDateID(featured.startsAt);

  return (
    <View className="overflow-hidden rounded-5xl" testID="home-hero">
      <ImageBackground
        source={{ uri: image }}
        resizeMode="cover"
        style={{ minHeight: 420, justifyContent: "flex-end" }}
      >
        {/* Dark scrim so text stays legible over any photo. */}
        <View
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(10,10,12,0.55)" }}
        />
        <View className="p-6">
          <View className="mb-3 flex-row">
            <View className="flex-row items-center gap-2 rounded-pill border border-white/20 bg-white/10 px-3 py-1.75">
              <View className="h-1.75 w-1.75 rounded-full bg-brand" />
              <Text className="text-2xs font-semibold uppercase tracking-tag text-white">
                Live · Flash Sale
              </Text>
            </View>
          </View>

          <Text
            className="text-display font-extrabold text-white"
            accessibilityRole="header"
            numberOfLines={2}
          >
            {featured.name}
          </Text>

          <View className="mt-3 flex-row flex-wrap gap-4">
            {featured.venue ? (
              <Text className="text-sm text-white/80">📍 {featured.venue}</Text>
            ) : null}
            {dateTxt ? (
              <Text className="text-sm text-white/80">🗓 {dateTxt}</Text>
            ) : null}
          </View>

          <View className="mt-5 flex-row flex-wrap items-center gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Booking ${featured.name} sekarang`}
              onPress={() => onBook(featured.id)}
              testID="hero-book"
              className="flex-row items-center gap-3 rounded-pill bg-card py-3.5 pl-6 pr-3.5"
            >
              <Text className="text-md font-bold text-card-foreground">Booking Sekarang</Text>
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brand">
                <Text className="text-sm text-white" accessibilityElementsHidden>↗</Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lihat semua event"
              onPress={onSeeAll}
              testID="hero-see-all"
              className="rounded-pill border border-white/25 bg-white/10 px-6 py-3.5"
            >
              <Text className="text-md font-semibold text-white">Lihat Semua</Text>
            </Pressable>
          </View>

          {top.length > 1 ? (
            <View className="mt-6 flex-row gap-2" accessibilityElementsHidden>
              {top.map((e, i) => (
                <View
                  key={e.id}
                  className={`h-1.75 rounded-full ${i === 0 ? "w-6 bg-brand" : "w-1.75 bg-white/30"}`}
                />
              ))}
            </View>
          ) : null}
        </View>
      </ImageBackground>
    </View>
  );
}
