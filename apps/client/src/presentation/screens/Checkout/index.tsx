/**
 * Checkout PageScreen (folder index) — RBT-051 item-list slice.
 *
 *  Brutalist Mono implementation matching 03-checkout.html:
 * - Progress steps bar at top (4 steps: Pilih, Detail, Bayar, Selesai)
 * - Numbered sections with black boxes (1, 2, 3)
 * - 2px solid borders, no rounded corners
 * - Inter font family
 *
 * NIK is never logged; the buyer/attendee NIK fields are masked on handoff
 * (D7.1/D7.5). No infrastructure import — ports via useServices/hooks only.
 */
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { BackHandler, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlusIcon } from "@presentation/components/ArrowIcon";

import {
  appendRow,
  effectiveCap,
  isAttendeeBlocked,
  isAttendeeWarning,
  isCheckoutReady,
  isValidNik,
  maskNik,
  patchRowAt,
  removeRowAt,
  setBuyerUseAt,
  type AttendeeCheckResult,
  type TicketRow,
} from "@domain/rules/checkout";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { designColors } from "@presentation/theme";
import { WarningIcon } from "@presentation/components/ArrowIcon";
import { useAttendeeCheck } from "@presentation/hooks/useAttendeeCheck";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useRestoreBookingSession } from "@presentation/hooks/useBookingSession";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";
import { useHoldBooking } from "@presentation/hooks/useHoldBooking";
import { useSetBuyer } from "@presentation/hooks/useSetBuyer";
import {
  prefillFromProfile,
  useAccountStore,
} from "@presentation/stores/account-store";
import { useSessionStore } from "@presentation/stores/session-store";
import { useServices } from "@providers/service-context";

import { categoryPrice, emptyRow } from "./categories";
import { CheckoutBar } from "./fragments/CheckoutBar";
import { CheckoutHero } from "./fragments/CheckoutHero";
import { CheckoutTopBar } from "./fragments/CheckoutTopBar";
import { Field, Section } from "./fragments/common";
import { ConsentGate } from "./fragments/ConsentGate";
import { LeaveConfirm } from "./fragments/LeaveConfirm";
import { ProgressSteps } from "./fragments/ProgressSteps";
import { TicketItem } from "./fragments/TicketItem";
import type { CheckoutScreenProps, RowCheckStatus } from "./interface";
import { checkoutScrollContent, componentStyles } from "./style";
import { addTicketButtonStyle } from "./style";

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
  const { setBuyer } = useSetBuyer();
  const { hold, isHolding, error: holdError } = useHoldBooking();
  const setOrderDetail = useSessionStore((s) => s.setOrderDetail);
  // Select the STABLE profile reference (not a fresh object) so zustand does not
  // re-render every tick; derive the prefill from it with useMemo.
  const profile = useAccountStore((s) => s.profile);
  const prefill = useMemo(() => prefillFromProfile(profile), [profile]);
  // Logged-in users consented at registration; guests consent inline (AC3).
  const isGuest = !prefill.fromAccount;

  const [buyerNik, setBuyerNik] = useState("");
  // Prefill the email from the account on first render when logged in (AC1).
  const [buyerEmail, setBuyerEmail] = useState(prefill.emailMasked ?? "");
  const [rows, setRows] = useState<TicketRow[]>([emptyRow("")]);
  const [consent, setConsent] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!confirmLeave) setConfirmLeave(true);
        return true;
      },
    );
    return () => subscription.remove();
  }, [confirmLeave]);

  const cap = effectiveCap(session?.maxSelectable);

  const { remainingMs, expired } = useServerCountdown({
    clock: serverClock,
    expiresAtIso: session?.expiresAt,
    serverTimeIso: session?.serverTime,
    onExpire: () =>
      router.replace(
        `/expired/${sessionId}?reason=hold&eventId=${encodeURIComponent(session?.eventId ?? "")}` as Href,
      ),
  });

  // Guests must tick the inline consent; logged-in users already consented.
  const consentGiven = isGuest ? consent : true;

  useEffect(() => {
    const defaultCategoryId = session?.categories[0]?.categoryId;
    if (!defaultCategoryId) return;
    setRows((current) => {
      let changed = false;
      const next = current.map((row) => {
        if (row.categoryId) return row;
        changed = true;
        return { ...row, categoryId: defaultCategoryId };
      });
      return changed ? next : current;
    });
  }, [session?.categories]);

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
    () =>
      rows.reduce(
        (sum, row) =>
          sum + categoryPrice(row.categoryId, session?.categories ?? []),
        0,
      ),
    [rows, session?.categories],
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
  const addRow = (): void =>
    setRows((current) =>
      appendRow(
        current,
        emptyRow(session?.categories[0]?.categoryId ?? ""),
        cap,
      ),
    );
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
          onBack={() => setConfirmLeave(true)}
        />

        {/* Progress Steps Bar (prototype .progress-container) */}
        <ProgressSteps currentStep={2} />

        <ScrollView
          contentContainerStyle={checkoutScrollContent(isDesktop)}
          testID="checkout-scroll"
        >
          {session ? <CheckoutHero eventId={session.eventId} /> : null}

          <Section title="Data Pembeli" number={1}>
            {prefill.fromAccount ? (
              <View
                style={componentStyles.buyerPrefillBadge}
                testID="prefill-badge"
              >
                <Text
                  style={componentStyles.buyerPrefillBadgeText}
                  className="text-2xs font-v2 font-bold uppercase"
                >
                  Terisi dari akun
                </Text>
              </View>
            ) : null}
            <Field
              label="NIK Pembeli (16 digit)"
              value={buyerNik}
              onChangeText={(t) =>
                setBuyerNik(t.replace(/\D/g, "").slice(0, 16))
              }
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

          <Section title="Tiket" number={2}>
            {rows.map((row, i) => {
              const nik = row.useBuyerNik ? buyerNik : row.attendeeNik;
              return (
                // Key on the STABLE rowId (not the array index): rows are
                // add/remove-able, so an index key would remount the wrong
                // row's input state when a middle row is removed.
                <TicketItem
                  key={row.rowId}
                  index={i}
                  row={row}
                  canRemove={rows.length > 1}
                  onRemove={() => removeRow(i)}
                  onPatch={(p) => patchRow(i, p)}
                  onUseBuyer={(on) => setUseBuyer(i, on)}
                  status={rowStatus(checks[nik], !!pending[nik])}
                  categories={session?.categories ?? []}
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
              style={addTicketButtonStyle(rows, cap)}
            >
              <Text style={componentStyles.addTicketText}>
                <View className="flex-row items-center gap-2">
                  <PlusIcon color={designColors.ink} size={16} />
                  <Text style={componentStyles.addTicketLabel}>
                    Tambah tiket
                  </Text>
                </View>
              </Text>
            </Pressable>
            <View style={componentStyles.quotaWarning}>
              <WarningIcon color={designColors.warn} />
              <Text style={componentStyles.quotaWarningText}>
                Batas{" "}
                <Text style={componentStyles.quotaWarningEmphasis}>
                  {cap} tiket per NIK
                </Text>{" "}
                divalidasi server saat Lanjut Bayar. Tiap tiket butuh 1 NIK
                penonton.
              </Text>
            </View>
          </Section>

          {isGuest ? (
            <Section title="Persetujuan" number={3}>
              <ConsentGate checked={consent} onToggle={setConsent} />
            </Section>
          ) : null}
        </ScrollView>

        <CheckoutBar
          totalMinor={totalMinor}
          ready={ready}
          pending={isHolding}
          expired={expired}
          errorMessage={holdError?.userMessage}
          onSubmit={() => {
            // RBT-053 set-buyer (O1 mock), then RBT-054 idempotent hold →
            // redirect to payment. A typed conflict surfaces in CheckoutBar.
            void (async () => {
              await setBuyer({ sessionId, buyerNik, email: buyerEmail });
              try {
                const booking = await hold({ sessionId, rows, buyerNik });
                // RBT-070: record the order detail the success summary shows —
                // MASKED buyer NIK (never the raw NIK, D7.1/D7.5) + ticket qty.
                setOrderDetail(maskNik(buyerNik), rows.length);
                router.replace(`/payment/${booking.bookingId}` as Href);
              } catch {
                // holdError (DomainError.userMessage) is shown in CheckoutBar;
                // no navigation. The idempotency key is retained for retry.
              }
            })();
          }}
          bottomInset={insets.bottom}
        />

        <LeaveConfirm
          visible={confirmLeave}
          onStay={() => setConfirmLeave(false)}
          onLeave={() => {
            // Leaving releases the selection session → re-queue from home.
            setConfirmLeave(false);
            router.replace("/" as Href);
          }}
        />
      </View>
    </ScreenFade>
  );
}
