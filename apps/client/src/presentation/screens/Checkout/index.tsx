/**
 * Checkout PageScreen (folder index) — RBT-051 item-list slice.
 *
 * 1:1 of prototype `detail.html` checkout. This ticket (RBT-051) lands the
 * ticket ITEM LIST + quantity/category rules: min 1, max = effective cap
 * (≤ 3 per buyer-NIK), add/remove rows, per-row category + attendee fields, and
 * the single-use "Gunakan NIK pembeli" switch. Buyer-data validation detail is
 * RBT-052, buyer auto-fill + confirm-leave is RBT-053, the idempotent hold is
 * RBT-054 — each enriches this screen. The session + deadline come from RBT-050
 * (useBookingSession + useServerCountdown). Markup → ./fragments, styles →
 * ./style, types → ./interface, categories → ./categories.
 *
 * NIK is never logged; the buyer/attendee NIK fields are masked on handoff
 * (D7.1/D7.5). No infrastructure import — ports via useServices/hooks only.
 */
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  appendRow,
  effectiveCap,
  isCheckoutReady,
  isValidNik,
  patchRowAt,
  removeRowAt,
  setBuyerUseAt,
  type TicketRow,
} from "@domain/rules/checkout";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useRestoreBookingSession } from "@presentation/hooks/useBookingSession";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";
import { useServices } from "@providers/service-context";

import { categoryPrice, emptyRow } from "./categories";
import { CheckoutBar } from "./fragments/CheckoutBar";
import { CheckoutHero } from "./fragments/CheckoutHero";
import { CheckoutTopBar } from "./fragments/CheckoutTopBar";
import { Field, Section } from "./fragments/common";
import { TicketItem } from "./fragments/TicketItem";
import type { CheckoutScreenProps } from "./interface";
import { checkoutScrollContent } from "./style";

export function CheckoutScreen({ sessionId }: CheckoutScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsive();
  const { serverClock } = useServices();
  const { session, isLoading } = useRestoreBookingSession();

  const [buyerNik, setBuyerNik] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [rows, setRows] = useState<TicketRow[]>([emptyRow()]);

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

  const totalMinor = useMemo(
    () => rows.reduce((sum, r) => sum + categoryPrice(r.categoryId), 0),
    [rows],
  );

  // Row mutations delegate to the pure domain rules (cap / min-1 / single-use).
  const addRow = (): void => setRows((r) => appendRow(r, emptyRow(), cap));
  const removeRow = (i: number): void => setRows((r) => removeRowAt(r, i));
  const patchRow = (i: number, patch: Partial<TicketRow>): void =>
    setRows((r) => patchRowAt(r, i, patch));
  const setUseBuyer = (i: number, on: boolean): void =>
    setRows((r) => setBuyerUseAt(r, i, on));

  const warnTimer = remainingMs <= 60_000;

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background"
        testID="checkout-loading"
      >
        <Text className="text-sm text-muted-foreground">
          Memulihkan sesi pemilihan…
        </Text>
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
          onBack={() => router.replace("/" as Href)}
        />

        <ScrollView
          contentContainerStyle={checkoutScrollContent(isDesktop)}
          testID="checkout-scroll"
        >
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
              <Text className="text-sm font-bold text-foreground">
                ＋ Tambah tiket
              </Text>
            </Pressable>
            <View className="mt-3 flex-row items-center gap-2.25 rounded-md border border-warn/20 bg-warn/[0.08] px-3.5 py-3">
              <Text className="text-sm" accessibilityElementsHidden>
                ⚠
              </Text>
              <Text className="flex-1 text-xs text-muted-foreground">
                Batas{" "}
                <Text className="font-bold text-warn">{cap} tiket per NIK</Text>{" "}
                divalidasi server saat Lanjut Bayar. Tiap tiket butuh 1 NIK
                penonton.
              </Text>
            </View>
          </Section>
        </ScrollView>

        <CheckoutBar
          totalMinor={totalMinor}
          ready={ready}
          pending={false}
          expired={expired}
          onSubmit={() => {
            // RBT-054 wires the idempotent hold here; RBT-051 lands the item list.
          }}
          bottomInset={insets.bottom}
        />
      </View>
    </ScreenFade>
  );
}
