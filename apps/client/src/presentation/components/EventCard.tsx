/**
 * EventCard — one catalog row (RBT-030).
 *
 * Shows name, venue, date (DD-MMM-YYYY), price-from, and the availability badge.
 * A SOLD_OUT / CLOSED event is disabled (dimmed, not pressable). Pressing an
 * enterable card calls `onPress(eventId)` — the screen routes to the detail.
 *
 * Accessibility: the whole card is one button with a descriptive label; a
 * disabled card is still read but marked disabled.
 */
import { Pressable, Text, View } from "react-native";

import type { EventSummary } from "@domain/repositories/event.repository";
import { badgeFor } from "@domain/rules/event-display";
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
  const priceTxt =
    typeof event.minPriceMinor === "number"
      ? `Mulai ${minorToIDR(event.minPriceMinor)}`
      : "Harga menyusul";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.name}, ${event.venue ?? ""}, ${dateTxt}, ${badge.label}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => onPress(event.id)}
      testID={`event-card-${event.id}`}
      className={`rounded-4xl border border-line bg-card p-3.5 ${disabled ? "opacity-60" : ""}`}
    >
      <View className="flex-row items-start justify-between">
        <Text
          className="flex-1 pr-2 text-xl font-extrabold text-card-foreground"
          numberOfLines={2}
        >
          {event.name}
        </Text>
        <StatusBadge tone={badge.tone} label={badge.label} />
      </View>

      {event.venue ? (
        <Text className="mt-1.5 text-xs text-muted-foreground">
          📍 {event.venue}
        </Text>
      ) : null}

      {dateTxt ? (
        <Text className="mt-1.5 text-xs font-semibold text-muted-foreground">
          🗓 {dateTxt}
        </Text>
      ) : null}

      <View className="mt-3.5 flex-row items-center justify-between border-t border-line pt-3.25">
        <Text className="text-sm font-extrabold text-card-foreground">
          {priceTxt}
        </Text>
        <Text
          className={`text-sm font-bold ${disabled ? "text-muted-foreground" : "text-brand"}`}
        >
          {history ? "Berlalu" : disabled ? "Habis" : "Lihat →"}
        </Text>
      </View>
    </Pressable>
  );
}
