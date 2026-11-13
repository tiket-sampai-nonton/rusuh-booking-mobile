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
  const webLabel =
    start && end
      ? `Penjualan: ${formatWIBDateID(startsAt)} ${formatWIBTimeID(startsAt).replace(" WIB", "")} – ${formatWIBDateID(endsAt)} ${formatWIBTimeID(endsAt)}`
      : start
        ? `Penjualan tiket mulai: ${start}`
        : `Penjualan tiket berakhir: ${end}`;
  return (
    <View
      style={[
        styles.container,
        hero ? styles.hero : variant === "inline" ? styles.inline : undefined,
      ]}
      testID="ticket-sales-period"
    >
      {variant !== "card" ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={[styles.text, hero && styles.heroText]}>{webLabel}</Text>
        </ScrollView>
      ) : (
        <>
          <Text
            style={[
              styles.heading,
              hero && styles.heroText,
              variant === "card" && styles.cardHeading,
            ]}
          >
            Penjualan tiket
          </Text>
          {start ? (
            <Text
              style={[
                styles.text,
                hero && styles.heroText,
                variant === "card" && styles.cardText,
              ]}
            >
              Mulai: {start}
            </Text>
          ) : null}
          {end ? (
            <Text
              style={[
                styles.text,
                hero && styles.heroText,
                variant === "card" && styles.cardText,
              ]}
            >
              Berakhir: {end}
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
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
