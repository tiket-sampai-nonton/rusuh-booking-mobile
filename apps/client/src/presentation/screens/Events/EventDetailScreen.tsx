/**
 * EventDetailScreen — event detail + "Masuk Antrean" (RBT-032, E4).
 *
 * Wiring: screen → useEventDetail (query) + useJoinQueue (mutation) → use cases
 * → Event/Queue ports → mock adapters. Matches prototype `event.html`: hero
 * (name/venue/date + status badge), About (longDesc), Line-up, Terms, "Mulai
 * dari" min price, and the "Masuk Antrean" CTA. The CTA is anonymous (D8.5, no
 * login) — on success it routes to the waiting room.
 *
 * Availability: the CTA is disabled for SOLD_OUT / CLOSED / NOT_STARTED (badge
 * `disabled` or NOT_STARTED), matching the "enter via waiting room" rule.
 */
import { useRouter, type Href } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { badgeFor } from "@domain/rules/event-display";
import { parseDescription } from "@domain/rules/event-description";
import { eventImage } from "@domain/rules/event-image";
import { formatDateID, formatTimeID } from "@domain/services/date-format";
import { minorToIDR } from "@domain/services/money";
import { StatusBadge } from "@presentation/components/StatusBadge";
import { useEventDetail } from "@presentation/hooks/useEventDetail";
import { useJoinQueue } from "@presentation/hooks/useJoinQueue";

export interface EventDetailScreenProps {
  readonly eventId: string;
}

export function EventDetailScreen({ eventId }: EventDetailScreenProps) {
  const router = useRouter();
  const { data: event, isLoading, isError, error } = useEventDetail(eventId);
  const join = useJoinQueue();

  const onJoin = (): void => {
    join.mutate(eventId, {
      onSuccess: () => {
        router.push(`/waiting/${eventId}` as Href);
      },
    });
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background"
        testID="detail-loading"
      >
        <ActivityIndicator accessibilityLabel="Memuat detail event" />
      </View>
    );
  }

  if (isError || !event) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background p-6"
        testID="detail-error"
        accessibilityLiveRegion="polite"
      >
        <Text className="text-base font-bold text-error" accessibilityRole="header">
          Gagal memuat event
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {error?.message || "Event tidak ditemukan."}
        </Text>
      </View>
    );
  }

  const badge = badgeFor(event);
  const desc = parseDescription(event.description);
  const canJoin = !badge.disabled && event.status !== "NOT_STARTED";
  const dateTxt = formatDateID(event.startsAt);
  const timeTxt = formatTimeID(event.startsAt);
  const banner = eventImage(event.id, desc.bannerImage);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        testID="detail-scroll"
      >
        {/* Banner hero (prototype event.html .hero-ev). */}
        <ImageBackground
          source={{ uri: banner }}
          resizeMode="cover"
          style={{ minHeight: 320, justifyContent: "flex-end" }}
        >
          <View
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(10,10,12,0.5)" }}
          />
          <View className="p-5 pt-14">
            <View className="mb-3 flex-row">
              <StatusBadge tone={badge.tone} label={badge.label} />
            </View>
            <Text
              className="text-3xl font-extrabold text-white"
              accessibilityRole="header"
              numberOfLines={2}
            >
              {event.name}
            </Text>
            <Text className="mt-2 text-sm text-white/80">
              {[event.venue, dateTxt, timeTxt].filter(Boolean).join(" · ")}
            </Text>
          </View>
        </ImageBackground>

      <View className="px-5">
        {desc.longDesc ? (
          <Block title="Tentang event">
            <Text className="text-base text-foreground">{desc.longDesc}</Text>
          </Block>
        ) : null}

        {desc.lineup.length > 0 ? (
          <Block title="Line-up">
            <View className="gap-1.5">
              {desc.lineup.map((act) => (
                <Text key={act} className="text-base text-foreground">
                  • {act}
                </Text>
              ))}
            </View>
          </Block>
        ) : null}

        {desc.terms ? (
          <Block title="Syarat & Ketentuan">
            <Text className="text-sm text-muted-foreground">{desc.terms}</Text>
          </Block>
        ) : null}

        <Block title="Harga">
          <Text className="text-xs text-muted-foreground">Mulai dari</Text>
          <Text className="text-2xl font-extrabold text-foreground">
            {typeof event.minPriceMinor === "number"
              ? minorToIDR(event.minPriceMinor)
              : "Menyusul"}
          </Text>
          {typeof event.remainingTickets === "number" ? (
            <Text className="mt-1 text-xs text-muted-foreground">
              Sisa tiket: {event.remainingTickets}
            </Text>
          ) : null}
        </Block>
      </View>
      </ScrollView>

      <View className="border-t border-line bg-card p-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Masuk Antrean"
          accessibilityState={{ disabled: !canJoin || join.isPending }}
          disabled={!canJoin || join.isPending}
          onPress={onJoin}
          testID="join-cta"
          className={`items-center rounded-pill py-4 ${
            canJoin ? "bg-brand" : "bg-muted"
          }`}
        >
          <Text className="text-md font-bold text-white">
            {join.isPending
              ? "Mengambil antrean…"
              : canJoin
                ? "Masuk Antrean →"
                : badge.label}
          </Text>
        </Pressable>
        {join.isError ? (
          <Text
            className="mt-2 text-center text-xs text-error"
            accessibilityLiveRegion="polite"
          >
            {join.error?.message || "Gagal masuk antrean. Coba lagi."}
          </Text>
        ) : null}
        <Text className="mt-2 text-center text-2xs text-muted-foreground">
          Semua pembeli masuk lewat waiting room agar antrean tetap adil.
        </Text>
      </View>
    </View>
  );
}

function Block({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <View className="mt-6">
      <Text
        className="text-2xs font-bold uppercase tracking-tag text-muted-foreground"
        accessibilityRole="header"
      >
        {title}
      </Text>
      <View className="mt-2">{children}</View>
    </View>
  );
}
