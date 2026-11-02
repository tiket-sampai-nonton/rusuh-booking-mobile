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
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  appendRow,
  effectiveCap,
  isAttendeeBlocked,
  isAttendeeWarning,
  isCheckoutReady,
  isValidNik,
  patchRowAt,
  removeRowAt,
  setBuyerUseAt,
  type AttendeeCheckResult,
  type TicketRow,
} from "@domain/rules/checkout";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useAttendeeCheck } from "@presentation/hooks/useAttendeeCheck";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useRestoreBookingSession } from "@presentation/hooks/useBookingSession";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";
import { useAccountStore } from "@presentation/stores/account-store";
import { useServices } from "@providers/service-context";

import { categoryPrice, emptyRow } from "./categories";
import { CheckoutBar } from "./fragments/CheckoutBar";
import { CheckoutHero } from "./fragments/CheckoutHero";
import { CheckoutTopBar } from "./fragments/CheckoutTopBar";
import { Field, Section } from "./fragments/common";
import { ConsentGate } from "./fragments/ConsentGate";
import { TicketItem } from "./fragments/TicketItem";
import type { CheckoutScreenProps, RowCheckStatus } from "./interface";
import { checkoutScrollContent } from "./style";

/** Map a resolved NIK verdict (+ pending flag) to the row's display status. */
function rowStatus(
  verdict: AttendeeCheckResult | undefined,
  checking: boolean,
): RowCheckStatus {
  if (checking) return "checking";
  if (!verdict) return "idle";
  if (isAttendeeBlocked(verdict)) return "blocked";
  if (isAttendeeWarning(verdict)) return "warning";
  return "available";
}

export function CheckoutScreen({ sessionId }: CheckoutScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsive();
  const { serverClock } = useServices();
  const { session, isLoading } = useRestoreBookingSession();
  const { checks, pending, request } = useAttendeeCheck(sessionId);
  // Logged-in users consented at registration; guests consent inline (AC3).
  const isGuest = useAccountStore((s) => s.profile === undefined);

  const [buyerNik, setBuyerNik] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [rows, setRows] = useState<TicketRow[]>([emptyRow()]);
  const [consent, setConsent] = useState(false);

  const cap = effectiveCap(session?.maxSelectable);

  const { remainingMs, expired } = useServerCountdown({
    clock: serverClock,
    expiresAtIso: session?.expiresAt,
    serverTimeIso: session?.serverTime,
    onExpire: () => router.replace(`/expired/${sessionId}` as Href),
  });

  // Guests must tick the inline consent; logged-in users already consented.
  const consentGiven = isGuest ? consent : true;

  const ready = useMemo(
    () =>
      isCheckoutReady({
        buyerNik,
        buyerEmail,
        rows,
        maxSelectable: cap,
        attendeeChecks: checks,
        consentGiven,
      }),
    [buyerNik, buyerEmail, rows, cap, checks, consentGiven],
  );

  const totalMinor = useMemo(
    () => rows.reduce((sum, r) => sum + categoryPrice(r.categoryId), 0),
    [rows],
  );

  // Debounced attendee-NIK availability checks (AC2): request for each valid
  // resolved NIK (a useBuyerNik row resolves to the buyer NIK).
  useEffect(() => {
    for (const r of rows) {
      const nik = r.useBuyerNik ? buyerNik : r.attendeeNik;
      if (isValidNik(nik)) request(nik);
    }
  }, [rows, buyerNik, request]);

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
            {rows.map((row, i) => {
              const nik = row.useBuyerNik ? buyerNik : row.attendeeNik;
              return (
                <TicketItem
                  key={i}
                  index={i}
                  row={row}
                  canRemove={rows.length > 1}
                  onRemove={() => removeRow(i)}
                  onPatch={(p) => patchRow(i, p)}
                  onUseBuyer={(on) => setUseBuyer(i, on)}
                  status={rowStatus(checks[nik], !!pending[nik])}
                />
              );
            })}
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

          {isGuest ? (
            <Section title="Persetujuan">
              <ConsentGate checked={consent} onToggle={setConsent} />
            </Section>
          ) : null}
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
