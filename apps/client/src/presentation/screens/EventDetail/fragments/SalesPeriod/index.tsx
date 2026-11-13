import { ScrollView, StyleSheet, Text, View } from "react-native";

import { formatWIBDateID, formatWIBTimeID } from "@domain/services/date-format";
import { designColors } from "@presentation/theme/event-design-tokens";
import { plusJakartaSansFonts } from "@presentation/theme/fonts";

interface SalesPeriodProps {
  readonly startsAt?: string;
  readonly endsAt?: string;
  readonly variant?: "hero" | "inline" | "card";
}

function formatSalesTime(value?: string): string {
  return [formatWIBDateID(value), formatWIBTimeID(value)]
    .filter(Boolean)
    .join(" · ");
}

export function SalesPeriod({
  startsAt,
  endsAt,
  variant = "inline",
}: SalesPeriodProps) {
  const start = formatSalesTime(startsAt);
  const end = formatSalesTime(endsAt);
  if (!start && !end) return null;
  const hero = variant === "hero";
  const webLabel = formatWebLabel(start, end, startsAt, endsAt);
  const containerStyle = salesContainerStyle(variant);
  const card = variant === "card";
  return (
    <View
      style={[styles.container, containerStyle]}
      testID="ticket-sales-period"
    >
      {!card ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={[styles.text, textVariantStyle(hero, false)]}>
            {webLabel}
          </Text>
        </ScrollView>
      ) : (
        <>
          <Text style={[styles.heading, styles.cardHeading]}>
            Penjualan tiket
          </Text>
          {start ? (
            <Text style={[styles.text, styles.cardText]}>Mulai: {start}</Text>
          ) : null}
          {end ? (
            <Text style={[styles.text, styles.cardText]}>Berakhir: {end}</Text>
          ) : null}
        </>
      )}
    </View>
  );
}

function formatWebLabel(
  start: string,
  end: string,
  startsAt?: string,
  endsAt?: string,
): string {
  if (start && end) {
    const startTime = formatWIBTimeID(startsAt).replace(" WIB", "");
    const endTime = formatWIBTimeID(endsAt);
    return `Penjualan: ${formatWIBDateID(startsAt)} ${startTime} – ${formatWIBDateID(endsAt)} ${endTime}`;
  }
  if (start) return `Penjualan tiket mulai: ${start}`;
  return `Penjualan tiket berakhir: ${end}`;
}

function salesContainerStyle(variant: "hero" | "inline" | "card") {
  if (variant === "hero") return styles.hero;
  if (variant === "inline") return styles.inline;
  return undefined;
}

function textVariantStyle(hero: boolean, card: boolean) {
  if (card) return styles.cardText;
  if (hero) return styles.heroText;
  return undefined;
}

const styles = StyleSheet.create({
  container: { alignSelf: "flex-start", maxWidth: "100%", gap: 3 },
  hero: {
    backgroundColor: designColors.ground,
    borderWidth: 2,
    borderColor: designColors.ink,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  inline: { marginTop: 10, marginBottom: 10 },
  heading: {
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 11,
  },
  text: {
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.semiBold,
    fontSize: 12,
    lineHeight: 17,
  },
  heroText: { color: designColors.ink },
  cardHeading: {
    color: designColors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardText: { fontSize: 14, lineHeight: 21 },
});
