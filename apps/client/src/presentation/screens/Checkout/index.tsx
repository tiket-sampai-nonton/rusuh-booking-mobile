/**
 * Checkout PageScreen (folder index) — RBT-051 item-list slice.
 *
 *  Brutalist Mono implementation matching 03-checkout.html:
 * - Progress steps bar at top (4 steps: Pilih, Detail, Bayar, Selesai)
 * - Numbered sections with black boxes (1, 2, 3)
 * - 2px solid borders, no rounded corners
 * - Plus Jakarta Sans font family
 *
 * NIK is never logged; the buyer/attendee NIK fields are masked on handoff
 * (D7.1/D7.5). No infrastructure import — ports via useServices/hooks only.
 */
import { useNavigation, useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlusIcon } from "@presentation/components/ArrowIcon";
import { DomainError } from "@domain/errors/domain-error";

import {
  appendRow,
  attendeeNiksUnique,
  effectiveCap,
  isAttendeeBlocked,
  isAttendeeWarning,
  isCheckoutReady,
  isValidEmail,
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
import { useEventDetail } from "@presentation/hooks/useEventDetail";
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
import { CheckoutSessionUnavailable } from "./fragments/CheckoutSessionUnavailable";
import { checkoutScrollContent, componentStyles } from "./style";
import { addTicketButtonStyle } from "./style";
import { apiErrorMessage } from "@presentation/utils/api-error-message";
import { LoginModal } from "@presentation/components/auth/LoginModal";

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
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDesktop, isMobileWeb } = useResponsive();
  const { serverClock, bookingRepository, queueMembership } = useServices();
  const {
    session,
    isLoading,
    error: sessionError,
    retry,
  } = useRestoreBookingSession(true, sessionId);
  const {
    data: eventDetail,
    isError: eventDetailError,
    refetch: retryEventDetail,
  } = useEventDetail(session?.eventId ?? "");
  const { checks, pending, request } = useAttendeeCheck(sessionId);
  const { hold, isHolding, error: holdError, resetError } = useHoldBooking();
  const setOrderDetail = useSessionStore((s) => s.setOrderDetail);
  // Select the STABLE profile reference (not a fresh object) so zustand does not
  // re-render every tick; derive the prefill from it with useMemo.
  const profile = useAccountStore((s) => s.profile);
  const accountEmail = useAccountStore((s) => s.buyerEmail);
  const prefill = useMemo(
    () => prefillFromProfile(profile, accountEmail),
    [profile, accountEmail],
  );
  // Logged-in users consented at registration; guests consent inline (AC3).
  const isGuest = !prefill.fromAccount;

  const [buyerName, setBuyerName] = useState(prefill.fullName ?? "");
  const [buyerNik, setBuyerNik] = useState("");
  // The full login email is restored from BuyerEmailStorage when available;
  // the profile API returns only a masked address.
  const [buyerEmail, setBuyerEmail] = useState(prefill.email ?? "");
  const [emailConfirmation, setEmailConfirmation] = useState(
    prefill.email ?? "",
  );
  const [leaveError, setLeaveError] = useState("");
  const [rows, setRows] = useState<TicketRow[]>([emptyRow("")]);
  const [consent, setConsent] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [buyerUsesSavedNik, setBuyerUsesSavedNik] = useState(false);
  const [authRecoveryOpen, setAuthRecoveryOpen] = useState(false);

  // Profile names may arrive after the checkout screen mounts. Fill an empty
  // buyer name field once, without overwriting anything the user entered.
  useEffect(() => {
    if (!prefill.fromAccount || !prefill.fullName?.trim()) return;
    setBuyerName((current) => current || prefill.fullName || "");
  }, [prefill.fromAccount, prefill.fullName]);

  useEffect(() => {
    if (!prefill.fromAccount || !prefill.email?.trim()) return;
    setBuyerEmail((current) => current || prefill.email || "");
    setEmailConfirmation((current) => current || prefill.email || "");
  }, [prefill.email, prefill.fromAccount]);

  useEffect(() => {
    const booking = session?.booking;
    if (!booking || session?.sessionId !== sessionId) return;
    if (booking.status === "PENDING_PAYMENT") {
      router.replace(`/payment/${booking.bookingId}` as Href);
    } else if (
      booking.status === "PAID" ||
      booking.status === "VERIFYING" ||
      booking.status === "REVIEW"
    ) {
      router.replace(`/payment-result/${booking.bookingId}` as Href);
    } else if (booking.status === "EXPIRED" || booking.status === "CANCELLED") {
      router.replace(
        `/failed/${booking.bookingId}?reason=payment&bookingId=${booking.bookingId}` as Href,
      );
    }
  }, [router, session, sessionId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      const actionType = event.data.action.type;
      if (
        actionType === "GO_BACK" ||
        actionType === "POP" ||
        actionType === "POP_TO_TOP"
      ) {
        event.preventDefault();
        setConfirmLeave(true);
      }
    });
    return unsubscribe;
  }, [navigation]);

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
        `/failed/${sessionId}?reason=hold&eventId=${encodeURIComponent(session?.eventId ?? "")}` as Href,
      ),
  });

  useEffect(() => {
    if (
      sessionError instanceof DomainError &&
      (sessionError.code === "SESSION_EXPIRED" ||
        sessionError.code === "SESSION_INVALID")
    ) {
      router.replace(`/failed/${sessionId}?reason=hold` as Href);
    }
  }, [router, sessionError, sessionId]);

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

  // A ticket using buyer identity resolves to the current buyer name + NIK.
  // Keep the attendee's own fields untouched so switching the option off
  // restores the identity they had entered for that ticket.
  const resolvedBuyerNik = buyerUsesSavedNik ? "" : buyerNik;
  const resolvedRows = useMemo(
    () =>
      rows.map((row) =>
        row.useBuyerNik
          ? {
              ...row,
              attendeeName: buyerName,
              attendeeNik: resolvedBuyerNik,
            }
          : row,
      ),
    [rows, buyerName, resolvedBuyerNik],
  );

  const ready = useMemo(
    () =>
      buyerEmail.trim() === emailConfirmation.trim() &&
      isCheckoutReady({
        buyerNik: resolvedBuyerNik,
        buyerUsesSavedNik,
        buyerEmail,
        rows: resolvedRows,
        maxSelectable: cap,
        attendeeChecks: checks,
        consentGiven,
      }),
    [
      resolvedBuyerNik,
      buyerUsesSavedNik,
      buyerEmail,
      emailConfirmation,
      resolvedRows,
      cap,
      checks,
      consentGiven,
    ],
  );

  const buyerNameRequired = rows.some((row) => row.useBuyerNik);
  const buyerNameError =
    submitAttempted && buyerNameRequired && !buyerName.trim()
      ? "Nama pembeli wajib diisi untuk menggunakan data pembeli."
      : undefined;
  const buyerNikError =
    !buyerUsesSavedNik &&
    ((submitAttempted && !buyerNik.trim()) ||
      (buyerNik.length > 0 && !isValidNik(buyerNik)))
      ? buyerNik.length > 0
        ? "NIK pembeli harus terdiri dari 16 digit."
        : "NIK pembeli wajib diisi (16 digit)."
      : undefined;
  const buyerEmailError =
    (submitAttempted && !buyerEmail.trim()) ||
    (buyerEmail.length > 0 && !isValidEmail(buyerEmail))
      ? buyerEmail.trim()
        ? "Masukkan alamat email yang valid."
        : "Email wajib diisi."
      : undefined;
  const emailConfirmationError =
    (submitAttempted && !emailConfirmation.trim()) ||
    (emailConfirmation.length > 0 &&
      emailConfirmation.trim() !== buyerEmail.trim())
      ? emailConfirmation.trim()
        ? "Konfirmasi email harus sama dengan email pembeli."
        : "Konfirmasi email wajib diisi."
      : undefined;
  const attendeeNiksAreUnique = attendeeNiksUnique(
    resolvedRows,
    resolvedBuyerNik,
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
      if (r.useBuyerNik && buyerUsesSavedNik) continue;
      const nik = r.useBuyerNik ? buyerNik : r.attendeeNik;
      if (isValidNik(nik)) request(nik);
    }
  }, [rows, buyerNik, buyerUsesSavedNik, request]);

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

  const handleSubmit = (): void => {
    setSubmitAttempted(true);
    if (!ready) return;
    // The hold use case keeps one idempotency key across dependency retries.
    void (async () => {
      try {
        const booking = await hold({
          sessionId,
          rows: resolvedRows,
          buyerNik: buyerUsesSavedNik ? "" : buyerNik,
          buyer: {
            ...(buyerUsesSavedNik ? { useLoginNik: true } : { nik: buyerNik }),
            email: buyerEmail.trim(),
            emailConfirmation: emailConfirmation.trim(),
            consent: consentGiven,
          },
        });
        // The server supplies the masked saved NIK to the account profile.
        // Never derive or persist a raw value for this summary.
        setOrderDetail(
          buyerUsesSavedNik ? (prefill.nikMasked ?? "****") : maskNik(buyerNik),
          rows.length,
        );
        router.replace(`/payment/${booking.bookingId}` as Href);
      } catch {
        // holdError (DomainError.userMessage) is shown in CheckoutBar; stay on
        // this screen so the user can recover or retry the same action.
      }
    })();
  };

  const holdErrorActionLabel =
    holdError?.code === "NIK_NOT_LINKED"
      ? "Masukkan NIK manual"
      : holdError?.kind === "auth"
        ? "Masuk kembali"
        : holdError?.kind === "dependency"
          ? "Coba lagi"
          : undefined;

  const handleHoldErrorAction = (): void => {
    if (holdError?.code === "NIK_NOT_LINKED") {
      resetError();
      setBuyerUsesSavedNik(false);
    } else if (holdError?.kind === "auth") {
      resetError();
      setAuthRecoveryOpen(true);
    } else if (holdError?.kind === "dependency") {
      handleSubmit();
    }
  };

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

  if (!session || session.sessionId !== sessionId) {
    return (
      <CheckoutSessionUnavailable
        hasError={Boolean(sessionError)}
        errorMessage={sessionError ? apiErrorMessage(sessionError) : undefined}
        onRetry={() => void retry()}
        onBrowse={() => router.replace("/browse" as Href)}
      />
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
        <ProgressSteps currentStep={3} />

        <ScrollView
          contentContainerStyle={checkoutScrollContent(isDesktop, isMobileWeb)}
          testID="checkout-scroll"
        >
          {session ? (
            <CheckoutHero
              eventId={session.eventId}
              eventName={eventDetail?.name}
              eventNameError={eventDetailError}
              isMobileWeb={isMobileWeb}
              onRetryEventName={() => void retryEventDetail()}
            />
          ) : null}

          <Section title="Data Pembeli" number={1}>
            {prefill.fromAccount ? (
              <View
                style={componentStyles.buyerPrefillBadge}
                testID="prefill-badge"
              >
                <Text
                  style={componentStyles.buyerPrefillBadgeText}
                  className="text-2xs font-sans font-bold uppercase"
                >
                  Akun terhubung
                </Text>
              </View>
            ) : null}
            <Field
              label="Nama Pembeli"
              value={buyerName}
              onChangeText={setBuyerName}
              placeholder="Nama sesuai KTP"
              testID="buyer-name"
              invalid={Boolean(buyerNameError)}
              errorMessage={buyerNameError}
            />
            {prefill.fromAccount && prefill.hasNik ? (
              <View className="mt-4 flex-row items-center justify-between border-2 border-ink bg-card p-3">
                <View className="mr-3 flex-1">
                  <Text className="text-sm font-bold text-ink">
                    Gunakan NIK tersimpan di akun
                  </Text>
                  <Text className="mt-1 text-xs text-gray-600">
                    {prefill.nikMasked
                      ? `Akun ${prefill.nikMasked}`
                      : "NIK diambil aman oleh server"}
                  </Text>
                </View>
                <Switch
                  accessibilityLabel="Gunakan NIK tersimpan di akun untuk pembeli"
                  accessibilityState={{ checked: buyerUsesSavedNik }}
                  value={buyerUsesSavedNik}
                  onValueChange={setBuyerUsesSavedNik}
                  trackColor={{
                    false: designColors.field,
                    true: designColors.ink,
                  }}
                  thumbColor={designColors.ground}
                  testID="buyer-use-login-nik"
                />
              </View>
            ) : null}
            {buyerUsesSavedNik ? (
              <View className="mt-3 border-2 border-ink bg-card p-3">
                <Text className="text-xs font-bold uppercase text-ink">
                  NIK pembeli akan diambil dari akun Anda
                </Text>
              </View>
            ) : (
              <Field
                label="NIK Pembeli (16 digit)"
                value={buyerNik}
                onChangeText={(t) =>
                  setBuyerNik(t.replace(/\D/g, "").slice(0, 16))
                }
                placeholder="16 digit KTP pembeli"
                keyboardType="number-pad"
                testID="buyer-nik"
                invalid={Boolean(buyerNikError)}
                errorMessage={buyerNikError}
                helperText={
                  prefill.fromAccount && !prefill.hasNik
                    ? "Belum ada NIK yang tertaut ke akun. Anda tetap bisa mengisi NIK secara manual."
                    : undefined
                }
              />
            )}
            <Field
              label="Email"
              value={buyerEmail}
              onChangeText={setBuyerEmail}
              placeholder="kamu@email.com"
              keyboardType="email-address"
              testID="buyer-email"
              invalid={Boolean(buyerEmailError)}
              errorMessage={buyerEmailError}
              helperText={
                prefill.fromAccount
                  ? prefill.emailMasked && !prefill.email
                    ? `Email akun tersimpan sebagai ${prefill.emailMasked}. Masukkan email lengkap untuk checkout.`
                    : undefined
                  : undefined
              }
            />
            <Field
              label="Konfirmasi email"
              value={emailConfirmation}
              onChangeText={setEmailConfirmation}
              placeholder="Masukkan kembali email"
              keyboardType="email-address"
              testID="buyer-email-confirmation"
              invalid={Boolean(emailConfirmationError)}
              errorMessage={emailConfirmationError}
            />
          </Section>

          <Section title="Tiket" number={2}>
            {rows.map((row, i) => {
              const usesSavedNik = row.useBuyerNik && buyerUsesSavedNik;
              const nik = usesSavedNik
                ? ""
                : row.useBuyerNik
                  ? buyerNik
                  : row.attendeeNik;
              return (
                // Key on the STABLE rowId (not the array index): rows are
                // add/remove-able, so an index key would remount the wrong
                // row's input state when a middle row is removed.
                <TicketItem
                  key={row.rowId}
                  index={i}
                  row={row}
                  buyerName={buyerName}
                  buyerNik={buyerNik}
                  buyerUsesSavedNik={buyerUsesSavedNik}
                  categoryError={
                    submitAttempted && !row.categoryId
                      ? "Pilih kategori tiket."
                      : undefined
                  }
                  attendeeNameError={
                    submitAttempted &&
                    !row.useBuyerNik &&
                    !row.attendeeName.trim()
                      ? "Nama penonton wajib diisi."
                      : undefined
                  }
                  attendeeNikError={
                    !usesSavedNik && submitAttempted && !isValidNik(nik)
                      ? row.useBuyerNik
                        ? "Masukkan NIK pembeli yang valid pada bagian Data Pembeli."
                        : "NIK penonton wajib diisi (16 digit)."
                      : !usesSavedNik && !isValidNik(nik) && nik.length > 0
                        ? "NIK penonton harus terdiri dari 16 digit."
                        : submitAttempted && !attendeeNiksAreUnique
                          ? "NIK ini sudah digunakan pada tiket lain."
                          : undefined
                  }
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
              <ConsentGate
                checked={consent}
                onToggle={setConsent}
                onOpenPrivacy={() => router.push("/privacy" as Href)}
                errorMessage={
                  submitAttempted && !consent
                    ? "Persetujuan diperlukan sebelum melanjutkan."
                    : undefined
                }
              />
            </Section>
          ) : null}
        </ScrollView>

        <CheckoutBar
          totalMinor={totalMinor}
          pending={isHolding}
          expired={expired}
          errorMessage={holdError?.userMessage ?? (leaveError || undefined)}
          errorActionLabel={holdErrorActionLabel}
          onErrorAction={handleHoldErrorAction}
          onSubmit={handleSubmit}
          bottomInset={insets.bottom}
        />

        <LeaveConfirm
          visible={confirmLeave}
          onStay={() => setConfirmLeave(false)}
          onLeave={() => {
            // Leaving releases the selection session → re-queue from home.
            void (async () => {
              try {
                await bookingRepository.cancelSession?.(sessionId);
                await queueMembership.clear();
                setConfirmLeave(false);
                router.replace("/" as Href);
              } catch {
                setConfirmLeave(false);
                setLeaveError(
                  "Tidak dapat keluar dari sesi. Silakan coba lagi.",
                );
              }
            })();
          }}
        />
        <LoginModal
          visible={authRecoveryOpen}
          onClose={() => setAuthRecoveryOpen(false)}
          onOpenPrivacy={() => router.push("/privacy" as Href)}
        />
      </View>
    </ScreenFade>
  );
}
