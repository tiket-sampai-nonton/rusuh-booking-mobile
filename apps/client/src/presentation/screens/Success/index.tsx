/**
 * SuccessScreen — confirmed-order summary (RBT-070, E8, AC1/FR-22), V2 Brutalist Mono.
 *
 * Reached only after the RBT-063 verify gate confirmed PAID; this screen
 * RE-VERIFIES the authoritative status (never trusts navigation alone, D10.2)
 * and shows the order summary ONLY when getStatus reports PAID. While it is
 * still verifying it shows a brief processing state; a non-PAID terminal status
 * routes to the recovery screen. The e-ticket QR + download/share is RBT-071.
 *
 * SECURITY: renders the MASKED buyer NIK only (first 2 + last 2, D7.1/D7.5) —
 * the raw NIK never reaches the FE. noindex (transactional, SECURITY §6.5).
 *
 * V2 look (prototype 10-success): dark ground, green success ring, white
 * success card with a dark summary, white-primary / outline-secondary actions.
 */
import { useRouter, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { minorToIDR } from "@domain/services/money";
import { ETicketCard, ticketRef } from "@presentation/components/ETicketCard";
import { Seo } from "@presentation/components/Seo";
import { useETicketDownload } from "@presentation/hooks/useETicketDownload";
import { CheckIcon, MailIcon } from "@presentation/components/ArrowIcon";
import { useVerifyPayment } from "@presentation/hooks/useVerifyPayment";
import { useEventDetail } from "@presentation/hooks/useEventDetail";
import { ArrowIcon } from "@presentation/components/ArrowIcon";
import { useSessionStore } from "@presentation/stores/session-store";
import { v2, v2Border } from "@presentation/theme";

export interface SuccessScreenProps {
  readonly bookingId: string;
}

interface TicketQrRef {
  toDataURL: (callback: (value: string) => void) => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3.5 py-1">
      <Text className="text-xs text-white/60">{label}</Text>
      <Text className="flex-1 text-right text-sm font-bold text-white">{value}</Text>
    </View>
  );
}

export function SuccessScreen({ bookingId }: SuccessScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const attemptId = useSessionStore((s) => s.attemptId);
  const amountMinor = useSessionStore((s) => s.amountMinor);
  const buyerNikMasked = useSessionStore((s) => s.buyerNikMasked);
  const ticketCount = useSessionStore((s) => s.ticketCount);
  const eventId = useSessionStore((s) => s.eventId);
  const { data: event } = useEventDetail(eventId ?? "");

  // Re-verify authoritatively. verdict "failed" → the recovery screen; a
  // pending verdict stays on the processing state (the gate routes here on
  // PAID, so this is a safety re-check, not the primary poll).
  const { verdict, isLoading } = useVerifyPayment(attemptId, bookingId);
  const { downloadTickets } = useETicketDownload();
  const count = ticketCount ?? 1;
  const qrRefs = useRef<(TicketQrRef | null)[]>([]);
  const [downloadError, setDownloadError] = useState("");

  const handleDownload = async () => {
    setDownloadError("");
    try {
      const qrImages = await Promise.all(Array.from({ length: count }, (_, index) => new Promise<string>((resolve, reject) => {
        const qr = qrRefs.current[index];
        if (!qr) return reject(new Error("QR tiket belum siap. Coba lagi."));
        qr.toDataURL((value) => value ? resolve(value.replace(/^data:image\/png;base64,/, "")) : reject(new Error("QR tiket tidak dapat dibuat.")));
      })));
      await downloadTickets(bookingId, count, qrImages, event?.name);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "E-tiket gagal disimpan. Coba lagi.");
    }
  };

  useEffect(() => {
    if (verdict === "failed") {
      router.replace(
        `/expired/${bookingId}?reason=payment&bookingId=${bookingId}` as Href,
      );
    }
  }, [verdict, bookingId, router]);

  const confirmed = verdict === "paid";

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: v2.ink, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
      testID="success-screen"
    >
      <Seo
        title="E-Tiket"
          description="Tiket Anda telah dikonfirmasi."
        path={`/success/${bookingId}`}
        noindex
      />
      {!confirmed ? (
        <View
          className="items-center gap-4"
          accessibilityLiveRegion="polite"
          testID="success-verifying"
        >
          <ActivityIndicator
            size="large"
            color={v2.ground}
            accessibilityLabel="Memverifikasi pembayaran"
          />
          <Text className="text-center text-base text-white">
            {isLoading ? "Memverifikasi pembayaran…" : "Menyiapkan tiket…"}
          </Text>
        </View>
      ) : (
        <>
        <View style={{ position: "absolute", left: -10000, top: 0, opacity: 0 }} pointerEvents="none" accessibilityElementsHidden>
          {Array.from({ length: count }, (_, index) => <QRCode key={index} value={ticketRef(bookingId, index)} size={240} getRef={(ref) => { qrRefs.current[index] = ref; }} />)}
        </View>
        <ScrollView
          className="w-full"
          contentContainerClassName="w-full max-w-md self-center"
          contentContainerStyle={{ paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Green success ring (prototype `.success-icon`). */}
          <View className="mb-6 items-center">
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
                style={{ borderWidth: 2, borderColor: v2.ground }}
            >
              <CheckIcon color={v2.ground} size={32} />
            </View>
          </View>

          <Text
            className="text-center text-2xs font-extrabold uppercase"
            style={{ color: v2.success, letterSpacing: 2 }}
            testID="success-eyebrow"
          >
            Pembayaran berhasil
          </Text>
          <Text
            className="mt-2 text-center text-2xl font-extrabold uppercase text-white"
            style={{ letterSpacing: -1 }}
            accessibilityRole="header"
          >
            Tiket kamu sudah aktif
          </Text>
          <Text className="mt-2.5 text-center text-xs leading-5 text-white/70">
            Simpan e-tiket ini. Tunjukkan QR di pintu masuk.
          </Text>

          {/* Summary card — translucent on the dark ground (prototype `.summary-card`). */}
          <View
            className="my-6 gap-1 p-5"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <SummaryRow label="Nomor Pesanan" value={bookingId} />
            <SummaryRow label="Jumlah tiket" value={`${ticketCount ?? 1} tiket`} />
            <SummaryRow label="Total dibayar" value={minorToIDR(amountMinor)} />
            <SummaryRow label="NIK pembeli" value={buyerNikMasked ?? "••••"} />
          </View>

          {/* One e-ticket card + QR per ticket (RBT-071). QR encodes a safe
              reference, never PII. */}
          <View className="gap-6" testID="eticket-list">
            {Array.from({ length: count }, (_, i) => (
              // Static derived list (fixed length, never reordered): the
              // booking id + ticket index IS the stable identity.
              <ETicketCard
                key={`${bookingId}-ticket-${i}`}
                bookingId={bookingId}
                index={i}
                total={count}
                eventName={event?.name}
                venue={event?.venue}
                startsAt={event?.startsAt}
                attendeeNikMasked={buyerNikMasked}
              />
            ))}
          </View>

          <View className="mt-7 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Unduh e-tiket"
              testID="success-download"
              onPress={() => void handleDownload()}
              className="flex-1 items-center py-4"
              style={{ backgroundColor: v2.ground, borderWidth: v2Border.base, borderColor: v2.ground }}
            >
              <View className="flex-row items-center gap-2"><ArrowIcon direction="download" color={v2.ink} /><Text className="text-sm font-bold uppercase" style={{ color: v2.ink, letterSpacing: 0.5 }}>Unduh E-Tiket</Text></View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ke Beranda"
              testID="success-home"
              onPress={() => router.replace("/" as Href)}
              className="flex-1 items-center py-4"
              style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" }}
            >
              <Text className="text-sm font-bold uppercase text-white" style={{ letterSpacing: 0.5 }}>
                Ke Beranda
              </Text>
            </Pressable>
          </View>
          {downloadError ? <Text className="mt-3 text-center text-xs" style={{ color: v2.accent }}>{downloadError}</Text> : null}

          {/* Email note (v2-mobile prototype 10-success.html `.email-note`) */}
          <View className="mt-4 flex-row items-center justify-center gap-2">
            <MailIcon color="rgba(255,255,255,0.6)" size={16} />
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>E-tiket juga dikirim ke email kamu</Text>
          </View>
        </ScrollView>
        </>
      )}
    </View>
  );
}
