/**
 * EventCard — one catalog card (RBT-030), 1:1 with prototype index.html `.card`.
 *
 * A 4:3 concert-photo thumbnail with the status badge overlaid top-left and a
 * price tag bottom-right; below it the title, 📍 venue and 🗓 date; a footer
 * row with "N tiket tersedia" and a circular ↗ action button. SOLD_OUT / CLOSED
 * cards dim and are non-interactive (✕ instead of ↗). The whole card is one
 * accessible button.
 */
import { Image, Pressable, Text, View } from "react-native";

import type { EventSummary } from "@domain/repositories/event.repository";
import { badgeFor } from "@domain/rules/event-display";
import { eventImage } from "@domain/rules/event-image";
import { formatDateID } from "@domain/services/date-format";
import { minorToIDR } from "@domain/services/money";

import { StatusBadge } from "./StatusBadge";

export interface EventCardProps {
  readonly event: EventSummary;
  readonly onPress: (eventId: string) => void;
  /** Force the history (dimmed, non-interactive) presentation. */
  readonly history?: boolean;
}

export function EventCard({ event, onPress, history = false }: EventCardProps) {
  const badge = badgeFor(event);
  const disabled = badge.disabled || history;
  const dateTxt = formatDateID(event.startsAt);
  const image = eventImage(event.id);
  const priceTxt =
    typeof event.minPriceMinor === "number"
      ? minorToIDR(event.minPriceMinor)
      : "Harga menyusul";
  const qtyTxt =
    disabled
      ? "—"
      : typeof event.remainingTickets === "number"
        ? `${event.remainingTickets.toLocaleString("id-ID")} tiket tersedia`
        : "Tersedia";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.name}, ${event.venue ?? ""}, ${dateTxt}, ${badge.label}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => onPress(event.id)}
      testID={`event-card-${event.id}`}
      className={`overflow-hidden rounded-5xl border border-line bg-card p-1.75 ${disabled ? "opacity-60" : ""}`}
    >
      {/* Thumbnail (4:3) with badge + price overlays. */}
      <View className="relative aspect-[4/3] overflow-hidden rounded-4xl bg-ink">
        <Image
          source={{ uri: image }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          style={{ width: "100%", height: "100%" }}
        />
        <View className="absolute left-3 top-3">
          <StatusBadge tone={badge.tone} label={badge.label} />
        </View>
        {!badge.disabled ? (
          <View className="absolute bottom-3 right-3 rounded-pill bg-card px-3 py-1.75">
            <Text className="text-xs font-extrabold text-card-foreground">
              {priceTxt}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Body. */}
      <View className="px-3.25 pb-3.25 pt-4">
        <Text
          className="text-xl font-extrabold text-card-foreground"
          numberOfLines={1}
        >
          {event.name}
        </Text>
        {event.venue ? (
          <Text className="mt-1.5 text-xs text-muted-foreground" numberOfLines={1}>
            📍 {event.venue}
          </Text>
        ) : null}
        {dateTxt ? (
          <Text className="mt-1.5 text-xs font-semibold text-muted-foreground">
            🗓 {dateTxt}
          </Text>
        ) : null}

        <View className="mt-4 flex-row items-center justify-between border-t border-line pt-3.25">
          <Text className="text-xs font-semibold text-muted-foreground">
            {qtyTxt}
          </Text>
          <View
            className={`h-9 w-9 items-center justify-center rounded-full ${disabled ? "bg-line" : "bg-ink"}`}
          >
            <Text className="text-sm text-white" accessibilityElementsHidden>
              {disabled ? "✕" : "↗"}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
