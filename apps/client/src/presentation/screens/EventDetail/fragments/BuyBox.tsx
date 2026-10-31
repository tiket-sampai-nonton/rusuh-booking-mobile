/** Buy box: "Mulai dari" + price, 2×2 facts grid, "Masuk Antrean" CTA + fine. */
import { Pressable, Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import { Fact } from "./Fact";
import type { BuyBoxProps } from "../interface";
import { detailCta, detailStyles } from "../style";

export function BuyBox({
  event,
  dateTxt,
  timeTxt,
  canJoin,
  pending,
  ctaLabel,
  errorMessage,
  onJoin,
}: BuyBoxProps) {
  const disabled = !canJoin || pending;
  return (
    <View style={detailStyles.buyBox}>
      <View style={detailStyles.buyPriceRow}>
        <Text style={detailStyles.buyPriceLabel} className="text-white/60">Mulai dari</Text>
        <Text style={detailStyles.buyPrice} className="font-extrabold text-white">
          {typeof event.minPriceMinor === "number"
            ? minorToIDR(event.minPriceMinor, { compact: true })
            : "Menyusul"}
        </Text>
      </View>

      {/* facts 2×2 grid. */}
      <View style={detailStyles.factsWrap}>
        <View style={detailStyles.factsRow}>
          <Fact label="Tanggal" value={dateTxt || "-"} />
          <Fact label="Waktu" value={timeTxt || "-"} />
        </View>
        <View style={detailStyles.factsRow}>
          <Fact label="Venue" value={event.venue?.split("·")[0].trim() || "-"} />
          <Fact label="Batas" value="3 tiket / NIK" />
        </View>
      </View>

      {/* Masuk Antrean CTA — white pill + red pin. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Masuk Antrean"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onJoin}
        testID="join-cta"
        style={detailCta(disabled)}
      >
        <Text style={detailStyles.ctaText} className="font-bold text-ink">{ctaLabel}</Text>
        {canJoin && !pending ? (
          <View style={detailStyles.ctaPin}>
            <Text style={detailStyles.ctaPinText} accessibilityElementsHidden>↗</Text>
          </View>
        ) : null}
      </Pressable>

      {errorMessage ? (
        <Text
          style={detailStyles.joinError}
          className="text-error-dark"
          accessibilityLiveRegion="polite"
        >
          {errorMessage}
        </Text>
      ) : null}

      <Text style={detailStyles.buyFine} className="text-white/45">
        Semua pembeli masuk lewat waiting room agar antrean tetap adil dan stok tetap akurat.
      </Text>
    </View>
  );
}
