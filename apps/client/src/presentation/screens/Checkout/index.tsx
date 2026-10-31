/**
 * Checkout PageScreen (folder index) — parent component (orchestration only).
 *
 * Buyer data + ticket items + idempotent hold (RBT-050…054), 1:1 of prototype
 * `detail.html` (the checkout page). Owns the ticket-row state, the hold timer,
 * the leave-confirm state, and the submit→payment handoff. NIK is masked on the
 * success handoff and never logged (D7.1/D7.5). Markup → ./fragments, styles →
 * ./style, types → ./interface, categories → ./categories (refactor rule).
 */
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { effectiveCap, isCheckoutReady, isValidNik, maskNik, type TicketRow } from "@domain/rules/checkout";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useCheckout } from "@presentation/hooks/useCheckout";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";
import { useSessionStore } from "@presentation/stores/session-store";
import { useServices } from "@providers/service-context";

import { categoryPrice, emptyRow } from "./categories";
import { CheckoutBar } from "./fragments/CheckoutBar";
import { CheckoutHero } from "./fragments/CheckoutHero";
import { CheckoutTopBar } from "./fragments/CheckoutTopBar";
import { Field, Section } from "./fragments/common";
import { LeaveConfirm } from "./fragments/LeaveConfirm";
import { TicketItem } from "./fragments/TicketItem";
import type { CheckoutScreenProps } from "./interface";
import { checkoutScrollContent } from "./style";

export function CheckoutScreen({ sessionId }: CheckoutScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsive();
  const { serverClock } = useServices();
  const { session, isLoading, hold } = useCheckout();
  const setOrderDetail = useSessionStore((s) => s.setOrderDetail);

  const [buyerNik, setBuyerNik] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [rows, setRows] = useState<TicketRow[]>([emptyRow()]);
  // Back → "Tinggalkan halaman ini?" confirm (prototype detail.html confirmBack).
  const [confirmLeave, setConfirmLeave] = useState(false);

  const cap = effectiveCap(session?.maxSelectable);

  const { remainingMs, expired } = useServerCountdown({
    clock: serverClock,
    expiresAtIso: session?.expiresAt,
    serverTimeIso: session?.serverTime,
    onExpire: () => router.replace(`/expired/${sessionId}` as Href),
  });

  const ready = useMemo(
    () => isCheckoutReady({ buyerNik, buyerEmail, rows, maxSelectable: cap }),
    [buyerNik, buyerEmail, rows, cap],
  );

  // Total = sum of each row's (mock, O2) category price — mirrors the prototype.
  const totalMinor = useMemo(
    () => rows.reduce((sum, r) => sum + categoryPrice(r.categoryId), 0),
    [rows],
  );

  const addRow = (): void => {
    if (rows.length >= cap) return;
    setRows((r) => [...r, emptyRow()]);
  };
  const removeRow = (i: number): void => {
    setRows((r) => (r.length <= 1 ? r : r.filter((_, idx) => idx !== i)));
  };
  const patchRow = (i: number, patch: Partial<TicketRow>): void => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  };
  // Single-use buyer NIK: turning it on for one row turns it off for the others.
  const setUseBuyer = (i: number, on: boolean): void => {
    setRows((r) =>
      r.map((row, idx) => ({
        ...row,
        useBuyerNik: idx === i ? on : on ? false : row.useBuyerNik,
      })),
    );
  };

  const onSubmit = (): void => {
    if (!ready || !session) return;
    hold.mutate(
      { sessionId: session.sessionId, rows, buyerNik },
      {
        onSuccess: (booking) => {
          // Carry the masked NIK + ticket count for the success summary
          // (masked only — never the raw NIK, D7.1/D7.5).
          setOrderDetail(maskNik(buyerNik), rows.length);
          router.push(`/payment/${booking.bookingId}` as Href);
        },
      },
    );
  };

  const warnTimer = remainingMs <= 60_000;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background" testID="checkout-loading">
        <Text className="text-sm text-muted-foreground">Memulihkan sesi pemilihan…</Text>
      </View>
    );
  }

  return (
    <ScreenFade>
      <View className="flex-1 bg-background">
        <CheckoutTopBar
          remainingMs={remainingMs}
          warn={warnTimer}
          expired={expired}
          onBack={() => setConfirmLeave(true)}
        />

        <ScrollView contentContainerStyle={checkoutScrollContent(isDesktop)} testID="checkout-scroll">
          {session ? <CheckoutHero eventId={session.eventId} /> : null}

          <Section title="Data Pembeli">
            <Field
              label="NIK Pembeli (16 digit)"
              value={buyerNik}
              onChangeText={(t) => setBuyerNik(t.replace(/\D/g, "").slice(0, 16))}
              placeholder="16 digit KTP pembeli"
              keyboardType="number-pad"
              testID="buyer-nik"
              invalid={buyerNik.length > 0 && !isValidNik(buyerNik)}
            />
            <Field
              label="Email"
              value={buyerEmail}
              onChangeText={setBuyerEmail}
              placeholder="kamu@email.com"
              keyboardType="email-address"
              testID="buyer-email"
            />
            <Text className="mt-2 text-2xs text-muted-foreground">
              NIK pembeli dipakai untuk batas 3 tiket/NIK & divalidasi server.
              Dengan lanjut, kamu setuju NIK & email diproses untuk pemesanan ini.
            </Text>
          </Section>

          <Section title="Tiket">
            {rows.map((row, i) => (
              <TicketItem
                key={i}
                index={i}
                row={row}
                canRemove={rows.length > 1}
                onRemove={() => removeRow(i)}
                onPatch={(p) => patchRow(i, p)}
                onUseBuyer={(on) => setUseBuyer(i, on)}
              />
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tambah tiket"
              accessibilityState={{ disabled: rows.length >= cap }}
              disabled={rows.length >= cap}
              onPress={addRow}
              testID="add-ticket"
              className={`mt-3 items-center rounded-md border border-dashed border-line py-3 ${rows.length >= cap ? "opacity-50" : ""}`}
            >
              <Text className="text-sm font-bold text-foreground">＋ Tambah tiket</Text>
            </Pressable>
            <View className="mt-3 flex-row items-center gap-2.25 rounded-md border border-warn/20 bg-warn/[0.08] px-3.5 py-3">
              <Text className="text-sm" accessibilityElementsHidden>⚠️</Text>
              <Text className="flex-1 text-xs text-muted-foreground">
                Batas <Text className="font-bold text-warn">{cap} tiket per NIK</Text> divalidasi
                server saat Lanjut Bayar. Tiap tiket butuh 1 NIK penonton.
              </Text>
            </View>
          </Section>
        </ScrollView>

        <CheckoutBar
          totalMinor={totalMinor}
          ready={ready}
          pending={hold.isPending}
          expired={expired}
          errorMessage={
            hold.isError ? hold.error?.message || "Gagal memproses pemesanan. Coba lagi." : undefined
          }
          onSubmit={onSubmit}
          bottomInset={insets.bottom}
        />

        <LeaveConfirm
          visible={confirmLeave}
          onStay={() => setConfirmLeave(false)}
          onLeave={() => {
            setConfirmLeave(false);
            router.replace("/" as Href);
          }}
        />
      </View>
    </ScreenFade>
  );
}
