/**
 * EventCard — 1:1 of the prototype index.html `.card`.
 *
 * Exact CSS mapping:
 *   .card        bg rgba(10,10,12,.03), border --line, radius 26, padding 7
 *   .thumb       radius 20, aspect 4/3, img object-fit cover
 *   .badge       top:12 left:12, uppercase .08em, tone bg (b-ok/b-low/b-soldout/b-done)
 *   .pricetag    bottom:12 right:12, white/92, weight 800, size 13
 *   .body        padding 16/13/13 ; h3 18/800 ; .loc muted 13 ; .evdate 12.5/600
 *   .foot        border-top --line, padding-top 14 ; .qty 12 muted (bold N) ; .go 36 ink
 *   .card.sold   opacity .62 saturate(.5)
 *
 * Status → badge mirrors the prototype `statusMeta`: SOLD_OUT/0-stock → "Sold
 * Out", CLOSED → "Selesai", rt<200 → "Stok Menipis", else "Tersedia".
 */
import { Image, Pressable, Text, View } from "react-native";

import type { EventSummary } from "@domain/repositories/event.repository";
import { badgeFor, type BadgeTone } from "@domain/rules/event-display";
import { eventImage } from "@domain/rules/event-image";
import { formatDateID } from "@domain/services/date-format";
import { minorToIDR } from "@domain/services/money";

export interface EventCardProps {
  readonly event: EventSummary;
  readonly onPress: (eventId: string) => void;
  readonly history?: boolean;
}

/** Badge background per tone (prototype b-ok/b-low/b-soon/b-soldout/b-done). */
const BADGE_BG: Record<BadgeTone, string> = {
  ok: "rgba(23,163,74,0.85)",
  low: "rgba(232,131,12,0.9)",
  soon: "rgba(59,130,246,0.85)",
  soldout: "rgba(10,10,12,0.72)",
  done: "rgba(10,10,12,0.72)",
};

/** Foot availability text color per tone (prototype .avail.lo/.ok/.soon). */
const AVAIL_COLOR: Record<BadgeTone, string> = {
  ok: "#17a34a",
  low: "#e8830c",
  soon: "#3b82f6",
  soldout: "#6b6b76",
  done: "#6b6b76",
};

export function EventCard({ event, onPress, history = false }: EventCardProps) {
  const badge = badgeFor(event);
  const disabled = badge.disabled || history;
  const dateTxt = formatDateID(event.startsAt);
  const image = eventImage(event.id);
  const rt = typeof event.remainingTickets === "number" ? event.remainingTickets : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.name}, ${event.venue ?? ""}, ${dateTxt}, ${badge.label}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => onPress(event.id)}
      testID={`event-card-${event.id}`}
      style={{
        backgroundColor: "rgba(10,10,12,0.03)",
        borderColor: "rgba(10,10,12,0.08)",
        borderWidth: 1,
        borderRadius: 26,
        padding: 7,
        opacity: disabled ? 0.62 : 1,
      }}
    >
      {/* Thumb (4:3) with badge + price overlays. */}
      <View style={{ borderRadius: 20, overflow: "hidden", aspectRatio: 4 / 3, backgroundColor: "#0a0a0c" }}>
        <Image
          source={{ uri: image }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          style={{ width: "100%", height: "100%" }}
        />
        <View
          style={{ position: "absolute", top: 12, left: 12, backgroundColor: BADGE_BG[badge.tone] }}
          className="rounded-pill px-2.75 py-1.5"
        >
          <Text style={{ letterSpacing: 1 }} className="text-2xs font-bold uppercase text-white">
            {badge.label}
          </Text>
        </View>
        {!badge.disabled ? (
          <View
            style={{ position: "absolute", bottom: 12, right: 12, backgroundColor: "rgba(255,255,255,0.92)" }}
            className="rounded-pill px-3 py-1.75"
          >
            <Text style={{ fontSize: 13 }} className="font-extrabold text-ink">
              {minorToIDR(event.minPriceMinor, { compact: true })}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Body. */}
      <View style={{ paddingTop: 16, paddingHorizontal: 13, paddingBottom: 13 }}>
        <Text style={{ fontSize: 18, letterSpacing: -0.36 }} className="font-extrabold text-ink" numberOfLines={1}>
          {event.name}
        </Text>
        {event.venue ? (
          <Text style={{ fontSize: 13, marginTop: 6 }} className="text-muted-foreground" numberOfLines={1}>
            📍 {event.venue}
          </Text>
        ) : null}
        {dateTxt ? (
          <Text style={{ fontSize: 12.5, marginTop: 8 }} className="font-semibold text-muted-foreground">
            🗓 {dateTxt}
          </Text>
        ) : null}

        <View
          style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(10,10,12,0.08)" }}
          className="flex-row items-center justify-between"
        >
          {disabled ? (
            <Text style={{ fontSize: 12, color: AVAIL_COLOR[badge.tone] }} className="font-semibold">
              {badge.tone === "done" ? "Event selesai" : "Sold Out"}
            </Text>
          ) : (
            <Text style={{ fontSize: 12 }} className="text-muted-foreground">
              <Text className="font-bold text-ink">{rt.toLocaleString("id-ID")}</Text> tiket tersedia
            </Text>
          )}
          <View
            style={{ width: 36, height: 36, backgroundColor: disabled ? "rgba(10,10,12,0.3)" : "#0a0a0c" }}
            className="items-center justify-center rounded-full"
          >
            <Text style={{ fontSize: 15 }} className="text-white" accessibilityElementsHidden>
              {disabled ? "✕" : "↗"}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
