/**
 * EventDetail PageScreen (folder index) — parent component (orchestration only).
 *
 * 1:1 of the prototype `event.html` (RBT-032, E4 Events). Wiring: useEventDetail
 * (TanStack Query) → GetEventDetail → EventRepository port → mock. The CTA is
 * anonymous (D8.5, no login) and status-driven: enabled "Masuk Antrean" only
 * when AVAILABLE, otherwise a disabled status label (Tiket Habis / Belum Dibuka
 * / Penjualan Ditutup). On an active press it enters the queue/booking flow by
 * navigating to the waiting room (`/waiting/<eventId>`) — the join-persistence
 * ticket (RBT-041) is not built yet, and the waiting route already accepts the
 * eventId. The opaque `description` record is read DEFENSIVELY via
 * `parseDescription`. Markup → ./fragments, styles → ./style, types →
 * ./interface (presentation refactor rule).
 */
import { useRouter, type Href } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { ctaFor } from "@domain/rules/event-detail-cta";
import { parseDescription } from "@domain/rules/event-description";
import { eventImage } from "@domain/rules/event-image";
import { formatDateID, formatTimeID } from "@domain/services/date-format";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEventDetail } from "@presentation/hooks/useEventDetail";
import { useResponsive } from "@presentation/hooks/useResponsive";

import { Block } from "./fragments/Block";
import { BuyBox } from "./fragments/BuyBox";
import { Categories } from "./fragments/Categories";
import { DetailBackground, MiniNav, Steps } from "./fragments/DetailChrome";
import { DetailHero } from "./fragments/DetailHero";
import { DetailError, DetailLoading } from "./fragments/DetailStates";
import { TrustBox } from "./fragments/TrustBox";
import type { EventDetailScreenProps } from "./interface";
import { detailScrollContent, detailStyles } from "./style";

/** Hero status pill copy (prototype `statusLabel`). */
function heroStatusLabel(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "LIVE · Tersedia";
    case "SOLD_OUT":
      return "Sold Out";
    case "NOT_STARTED":
      return "Segera Dibuka";
    case "CLOSED":
      return "Ditutup";
    default:
      return status;
  }
}

export function EventDetailScreen({ eventId }: EventDetailScreenProps) {
  const router = useRouter();
  const { data: event, isLoading, isError, error } = useEventDetail(eventId);
  const { isDesktop } = useResponsive();

  const goHome = (): void => router.push("/" as Href);

  if (isLoading) return <DetailLoading onBack={goHome} />;
  if (isError || !event) return <DetailError message={error?.message} onBack={goHome} />;

  const desc = parseDescription(event.description);
  const cta = ctaFor(event.status);
  const dateTxt = formatDateID(event.startsAt);
  const timeTxt = formatTimeID(event.startsAt);
  const banner = eventImage(event.id, desc.bannerImage);
  const meta = [dateTxt, timeTxt, event.venue].filter(Boolean).join(" · ");

  // On an active CTA press, enter the queue/booking flow (prototype: joinQueue →
  // waiting room). Join persistence is RBT-041 (not built); the waiting route
  // accepts the eventId directly, so route there.
  const onJoin = (): void => {
    if (!cta.enabled) return;
    router.push(`/waiting/${eventId}` as Href);
  };

  const chips: string[] = [];
  if (
    typeof event.remainingTickets === "number" &&
    event.status !== "SOLD_OUT" &&
    event.status !== "CLOSED"
  ) {
    chips.push(`${event.remainingTickets.toLocaleString("id-ID")} tiket tersedia`);
  }
  chips.push("Maks 3 tiket / NIK");

  return (
    <ScreenFade>
      <DetailBackground>
        <MiniNav onBack={goHome} />

        <ScrollView contentContainerStyle={detailScrollContent(isDesktop)} testID="detail-scroll">
          <Steps />

          <DetailHero
            banner={banner}
            statusLabel={heroStatusLabel(event.status)}
            name={event.name}
            meta={meta}
            chips={chips}
          />

          <Block label="Tentang event" heading={event.name} gap>
            <Text style={detailStyles.aboutText} className="text-white/60">
              {desc.longDesc || "Deskripsi event belum tersedia."}
            </Text>
          </Block>

          <Block label="Line-up" heading="Yang akan tampil." gap>
            <View style={detailStyles.lineupList}>
              {(desc.lineup.length > 0 ? desc.lineup : ["Diumumkan menyusul"]).map((act) => (
                <View key={act} style={detailStyles.lineupRow}>
                  <Text style={detailStyles.lineupText} className="font-bold text-white">
                    {act}
                  </Text>
                </View>
              ))}
            </View>
          </Block>

          <Block label="Syarat & Ketentuan" heading="Yang perlu kamu tahu." gap>
            {desc.terms.length > 0 ? (
              <View style={detailStyles.termsList}>
                {desc.terms.map((t) => (
                  <View key={t} style={detailStyles.termsRow}>
                    <Text style={detailStyles.termsCheck} accessibilityElementsHidden>
                      ✓
                    </Text>
                    <Text style={detailStyles.termsText} className="text-white/60">
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={detailStyles.lineupText} className="text-white/60">
                Ketentuan menyusul.
              </Text>
            )}
          </Block>

          <Block label="Kategori tiket" heading="Pilihan tempatmu.">
            <Categories categories={desc.categories} />
          </Block>

          <BuyBox
            event={event}
            dateTxt={dateTxt}
            timeTxt={timeTxt}
            canJoin={cta.enabled}
            ctaLabel={cta.label}
            onJoin={onJoin}
          />

          <TrustBox />
        </ScrollView>
      </DetailBackground>
    </ScreenFade>
  );
}
