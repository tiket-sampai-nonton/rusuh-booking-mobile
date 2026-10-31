/**
 * EventDetail PageScreen (folder index) — parent component (orchestration only).
 *
 * 1:1 of the prototype `event.html` (RBT-032, E4). Wiring: useEventDetail
 * (query) + useJoinQueue (mutation) → use cases → Event/Queue ports → mock. The
 * CTA is anonymous (D8.5, no login) and disabled for SOLD_OUT/CLOSED/NOT_STARTED;
 * on success → waiting room. Markup → ./fragments, styles → ./style, types →
 * ./interface (presentation refactor rule).
 */
import { useRouter, type Href } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { badgeFor } from "@domain/rules/event-display";
import { parseDescription } from "@domain/rules/event-description";
import { eventImage } from "@domain/rules/event-image";
import { formatDateID, formatTimeID } from "@domain/services/date-format";
import { AuraBackground } from "@presentation/components/AuraBackground";
import { MiniNav } from "@presentation/components/MiniNav";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { Steps } from "@presentation/components/Steps";
import { useEventDetail } from "@presentation/hooks/useEventDetail";
import { useJoinQueue } from "@presentation/hooks/useJoinQueue";
import { useResponsive } from "@presentation/hooks/useResponsive";

import { Block } from "./fragments/Block";
import { BuyBox } from "./fragments/BuyBox";
import { DetailError, DetailLoading } from "./fragments/DetailStates";
import { DetailHero } from "./fragments/DetailHero";
import { TrustBox } from "./fragments/TrustBox";
import type { EventDetailScreenProps } from "./interface";
import { detailScrollContent, detailStyles } from "./style";

export function EventDetailScreen({ eventId }: EventDetailScreenProps) {
  const router = useRouter();
  const { data: event, isLoading, isError, error } = useEventDetail(eventId);
  const join = useJoinQueue();
  const { isDesktop } = useResponsive();

  const goHome = (): void => router.push("/" as Href);
  const onJoin = (): void => {
    join.mutate(eventId, {
      onSuccess: () => {
        router.push(`/waiting/${eventId}` as Href);
      },
    });
  };

  if (isLoading) return <DetailLoading onBack={goHome} />;
  if (isError || !event) return <DetailError message={error?.message} onBack={goHome} />;

  const badge = badgeFor(event);
  const desc = parseDescription(event.description);
  const canJoin = !badge.disabled && event.status !== "NOT_STARTED";
  const dateTxt = formatDateID(event.startsAt);
  const timeTxt = formatTimeID(event.startsAt);
  const banner = eventImage(event.id, desc.bannerImage);

  const statusLabel =
    event.status === "AVAILABLE"
      ? "LIVE · Tersedia"
      : event.status === "SOLD_OUT"
        ? "Sold Out"
        : event.status === "NOT_STARTED"
          ? "Segera Dibuka"
          : "Ditutup";

  const chips: string[] = [];
  if (
    typeof event.remainingTickets === "number" &&
    event.status !== "SOLD_OUT" &&
    event.status !== "CLOSED"
  ) {
    chips.push(`${event.remainingTickets.toLocaleString("id-ID")} tiket tersedia`);
  }
  chips.push("Maks 3 tiket / NIK");

  const ctaLabel = join.isPending
    ? "Mengambil antrean…"
    : canJoin
      ? "Masuk Antrean"
      : event.status === "SOLD_OUT"
        ? "Tiket Habis"
        : event.status === "NOT_STARTED"
          ? "Belum Dibuka"
          : "Penjualan Ditutup";

  const meta = [dateTxt, timeTxt, event.venue].filter(Boolean).join(" · ");

  return (
    <ScreenFade>
      <AuraBackground>
        {/* Sticky mini-nav. */}
        <MiniNav onBack={goHome} />

        <ScrollView contentContainerStyle={detailScrollContent(isDesktop)} testID="detail-scroll">
          {/* Funnel steps — Detail active. */}
          <Steps active={0} />

          <DetailHero banner={banner} statusLabel={statusLabel} name={event.name} meta={meta} chips={chips} />

          {/* Tentang event. */}
          <Block label="Tentang event" heading={event.name} gap>
            <Text style={detailStyles.aboutText} className="text-white/60">
              {desc.longDesc || "Deskripsi event belum tersedia."}
            </Text>
          </Block>

          {/* Line-up. */}
          <Block label="Line-up" heading="Yang akan tampil." gap>
            <View style={detailStyles.lineupList}>
              {(desc.lineup.length > 0 ? desc.lineup : ["Diumumkan menyusul"]).map((act) => (
                <View key={act} style={detailStyles.lineupRow}>
                  <Text style={detailStyles.lineupText} className="font-bold text-white">{act}</Text>
                </View>
              ))}
            </View>
          </Block>

          {/* Syarat & Ketentuan. */}
          <Block label="Syarat & Ketentuan" heading="Yang perlu kamu tahu." gap>
            {desc.terms ? (
              <Text style={detailStyles.termsText} className="text-white/60">{desc.terms}</Text>
            ) : (
              <Text style={detailStyles.lineupText} className="text-white/60">Ketentuan menyusul.</Text>
            )}
          </Block>

          {/* Kategori tiket — categories are an O2 BE-NEED gap; chosen after queue. */}
          <Block label="Kategori tiket" heading="Pilihan tempatmu.">
            <Text style={detailStyles.termsText} className="text-white/60">
              Kategori &amp; harga final ditentukan server dan dipilih setelah kamu lolos antrean.
            </Text>
          </Block>

          <BuyBox
            event={event}
            dateTxt={dateTxt}
            timeTxt={timeTxt}
            canJoin={canJoin}
            pending={join.isPending}
            ctaLabel={ctaLabel}
            errorMessage={join.isError ? join.error?.message || "Gagal masuk antrean. Coba lagi." : undefined}
            onJoin={onJoin}
          />

          <TrustBox />
        </ScrollView>
      </AuraBackground>
    </ScreenFade>
  );
}
