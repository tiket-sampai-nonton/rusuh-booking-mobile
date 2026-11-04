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
import { neutral, status, withAlpha } from "@presentation/theme";
import { ArrowIcon, CloseIcon, CalendarIcon, PinIcon } from "@presentation/components/ArrowIcon";

export interface EventCardProps {
  readonly event: EventSummary;
  readonly onPress: (eventId: string) => void;
  readonly history?: boolean;
}

/** `--info` hue (prototype b-soon blue). Not a core token; local prototype value. */
const INFO = "#3b82f6";

/** Surface tints derived from the --ink token, not literals. */
const CARD_BG = withAlpha(neutral.ink, 0.03);
const INK_72 = withAlpha(neutral.ink, 0.72);
const INK_30 = withAlpha(neutral.ink, 0.3);

/** Badge background per tone (prototype b-ok/b-low/b-soon/b-soldout/b-done). */
const BADGE_BG: Record<BadgeTone, string> = {
  ok: withAlpha(status.ok, 0.85),
  low: withAlpha(status.warn, 0.9),
  soon: withAlpha(INFO, 0.85),
  soldout: INK_72,
  done: INK_72,
};

/** Foot availability text color per tone (prototype .avail.lo/.ok/.soon). */
const AVAIL_COLOR: Record<BadgeTone, string> = {
  ok: status.ok,
  low: status.warn,
  soon: INFO,
  soldout: neutral.muted,
  done: neutral.muted,
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
        backgroundColor: CARD_BG,
        borderColor: neutral.line,
        borderWidth: 1,
        borderRadius: 26,
        padding: 7,
        opacity: disabled ? 0.62 : 1,
      }}
    >
      {/* Thumb (4:3) with badge + price overlays. */}
      <View style={{ borderRadius: 20, overflow: "hidden", aspectRatio: 4 / 3, backgroundColor: neutral.ink }}>
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
            style={{ position: "absolute", bottom: 12, right: 12, backgroundColor: withAlpha(neutral.card, 0.92) }}
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
          <View className="mt-1.5 flex-row items-center gap-1.5">
            <PinIcon color={neutral.muted} size={13} />
            <Text style={{ fontSize: 13 }} className="text-muted-foreground" numberOfLines={1}>{event.venue}</Text>
          </View>
        ) : null}
        {dateTxt ? (
          <View className="mt-2 flex-row items-center gap-1.5">
            <CalendarIcon color={neutral.muted} size={13} />
            <Text style={{ fontSize: 12.5 }} className="font-semibold text-muted-foreground">{dateTxt}</Text>
          </View>
        ) : null}

        <View
          style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: neutral.line }}
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
            style={{ width: 36, height: 36, backgroundColor: disabled ? INK_30 : neutral.ink }}
            className="items-center justify-center rounded-full"
          >
            {disabled ? <CloseIcon color="#ffffff" size={15} /> : <ArrowIcon color="#ffffff" size={15} />}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
