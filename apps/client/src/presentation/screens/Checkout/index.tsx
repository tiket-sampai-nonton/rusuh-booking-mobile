/**
 * Checkout PageScreen (folder index) — RBT-051 item-list slice.
 *
 *  Brutalist Mono implementation matching 03-checkout.html:
 * - Progress steps bar at top (4 steps: Pilih, Detail, Bayar, Selesai)
 * - Numbered sections with black boxes (1, 2, 3)
 * - 2px solid borders, no rounded corners
 * - Plus Jakarta Sans font family
 *
 * NIK is never logged or persisted. The authenticated /me NIK is kept only in
 * this mounted screen's form state; booking summaries use its masked form.
 * No infrastructure import — ports via useServices/hooks only.
 */
import { CheckoutValidationFocus, ValidationTarget } from "./validation-focus";
import { useNavigation, useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlusIcon, WarningIcon } from "@presentation/components/Icon";
import { DomainError } from "@domain/errors/domain-error";
import type { BookingSession } from "@domain/repositories/booking.repository";
import type { DomainErrorKind } from "@domain/errors/domain-error";

import {
  appendRow,
  reconcileCheckoutCategories,
  canUseBuyerDataForTicket,
  checkoutTotalMinor,
  defaultCheckoutCategory,
  effectiveCap,
  isAttendeeBlocked,
  isAttendeeWarning,
  isValidNik,
  maskNik,
  normalizeNikInput,
  patchRowAt,
  removeRowAt,
  resolveBuyerTicketRows,
  setBuyerUseAt,
  type AttendeeCheckResult,
  type CheckoutIssue,
  type CheckoutIssues,
  type TicketRow,
  validateCheckout,
} from "@domain/rules/checkout";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { ConnectivityBanner } from "@presentation/components/ConnectivityBanner";
import { designColors } from "@presentation/theme";

import { useAttendeeCheck } from "@presentation/hooks/useAttendeeCheck";
import { useResponsive } from "@presentation/hooks/useResponsive";
import {
  useCancelBookingSession,
  useRestoreBookingSession,
} from "@presentation/hooks/useBookingSession";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";
import { useHoldBooking } from "@presentation/hooks/useHoldBooking";
import { useConnectivity } from "@presentation/hooks/useConnectivity";
import { useEventDetail } from "@presentation/hooks/useEventDetail";
import { useCheckoutAccountDetails } from "@presentation/hooks/useCheckoutAccountDetails";
import { useClearQueueMembership } from "@presentation/hooks/useRestoreMembership";
import {
  prefillFromProfile,
  useAccountStore,
} from "@presentation/stores/account-store";
import { useSessionStore } from "@presentation/stores/session-store";
import { useServices } from "@providers/service-context";

import { emptyRow } from "./categories";
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
import {
  checkoutScrollContent,
  componentStyles,
  addTicketButtonStyle,
} from "./style";

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

function requiredOrInvalidNikMessage(
  issue: "required" | "invalid" | undefined,
  subject: "pembeli" | "penonton",
): string | undefined {
  if (issue === "invalid") return `NIK ${subject} harus terdiri dari 16 digit.`;
  if (issue === "required") return `NIK ${subject} wajib diisi (16 digit).`;
  return undefined;
}

function requiredOrInvalidEmailMessage(
  issue: "required" | "invalid" | undefined,
): string | undefined {
  if (issue === "invalid") return "Masukkan alamat email yang valid.";
  if (issue === "required") return "Email wajib diisi.";
  return undefined;
}

function emailConfirmationMessage(
  issue: "required" | "mismatch" | undefined,
): string | undefined {
  if (issue === "mismatch")
    return "Konfirmasi email harus sama dengan email pembeli.";
  if (issue === "required") return "Konfirmasi email wajib diisi.";
  return undefined;
}

function isAccountCheckout(
  fromAccount: boolean,
  hasAuthToken: boolean,
  hasCheckoutDetails: boolean,
): boolean {
  return fromAccount || hasAuthToken || hasCheckoutDetails;
}

function buyerNameValidationMessage(
  issue: "required" | undefined,
): string | undefined {
  return issue === "required"
    ? "Nama pembeli wajib diisi untuk menggunakan data pembeli."
    : undefined;
}

function buyerNikHelperMessage(
  hasAccountNik: boolean,
  isAccountUser: boolean,
): string | undefined {
  if (hasAccountNik)
    return "NIK diisi dari akun dan tidak dapat diubah di sini.";
  if (isAccountUser)
    return "NIK akun tidak tersedia. Silakan isi NIK secara manual.";
  return undefined;
}

function buyerEmailHelperMessage(
  hasAccountEmail: boolean,
  isAccountUser: boolean,
  emailMasked: string | undefined,
  emailAvailable: boolean,
): string | undefined {
  if (hasAccountEmail)
    return "Email diisi dari akun dan tidak dapat diubah di sini.";
  if (isAccountUser && emailMasked && !emailAvailable) {
    return `Email akun tersimpan sebagai ${emailMasked}. Masukkan email lengkap untuk checkout.`;
  }
  return undefined;
}

function holdErrorActionLabel(
  kind: DomainErrorKind | undefined,
): string | undefined {
  if (kind === "auth") return "Masuk kembali";
  if (kind === "dependency") return "Coba lagi";
  return undefined;
}

function runHoldErrorAction(
  kind: DomainErrorKind | undefined,
  resetError: () => void,
  openAuthRecovery: () => void,
  retryHold: () => void,
): void {
  switch (kind) {
    case "auth":
      resetError();
      openAuthRecovery();
      return;
    case "dependency":
      retryHold();
      return;
    default:
      return;
  }
}

function hasRestoredSession(
  session: BookingSession | null | undefined,
  sessionId: string,
): session is BookingSession {
  return session?.sessionId === sessionId;
}

function sessionErrorMessage(error: unknown): string | undefined {
  return error ? apiErrorMessage(error) : undefined;
}

function isExpiredSessionError(error: unknown): error is DomainError {
  return (
    error instanceof DomainError &&
    (error.code === "SESSION_EXPIRED" || error.code === "SESSION_INVALID")
  );
}

function isNewExpiredHoldError(
  error: DomainError | null | undefined,
  handledCode: string | null,
): error is DomainError {
  return error?.kind === "session_expired" && error.code !== handledCode;
}

function attendeeNikMessage(
  issue: CheckoutIssue | undefined,
  useBuyerNik: boolean,
): string | undefined {
  if (issue === "required")
    return useBuyerNik
      ? "Masukkan NIK pembeli yang valid pada bagian Data Pembeli."
      : "NIK penonton wajib diisi (16 digit).";
  if (issue === "invalid") return "NIK penonton harus terdiri dari 16 digit.";
  if (issue === "duplicate") return "NIK ini sudah digunakan pada tiket lain.";
  if (issue === "already-registered")
    return "NIK sudah terdaftar untuk event ini.";
  return undefined;
}

interface CheckoutBuyerFieldsProps {
  readonly isAccountUser: boolean;
  readonly buyerName: string;
  readonly onBuyerNameChange: (value: string) => void;
  readonly buyerNameError?: string;
  readonly buyerNameHelperText?: string;
  readonly buyerNameLocked: boolean;
  readonly buyerNik: string;
  readonly onBuyerNikChange: (value: string) => void;
  readonly buyerNikError?: string;
  readonly buyerNikHelperText?: string;
  readonly buyerNikLocked: boolean;
  readonly buyerEmail: string;
  readonly onBuyerEmailChange: (value: string) => void;
  readonly buyerEmailError?: string;
  readonly buyerEmailHelperText?: string;
  readonly buyerEmailLocked: boolean;
  readonly emailConfirmation: string;
  readonly onEmailConfirmationChange: (value: string) => void;
  readonly emailConfirmationError?: string;
  readonly emailConfirmationHelperText?: string;
}

function CheckoutBuyerFields({
  isAccountUser,
  buyerName,
  onBuyerNameChange,
  buyerNameError,
  buyerNameHelperText,
  buyerNameLocked,
  buyerNik,
  onBuyerNikChange,
  buyerNikError,
  buyerNikHelperText,
  buyerNikLocked,
  buyerEmail,
  onBuyerEmailChange,
  buyerEmailError,
  buyerEmailHelperText,
  buyerEmailLocked,
  emailConfirmation,
  onEmailConfirmationChange,
  emailConfirmationError,
  emailConfirmationHelperText,
}: CheckoutBuyerFieldsProps) {
  return (
    <Section title="Data Pembeli" number={1}>
      {isAccountUser ? (
        <View style={componentStyles.buyerPrefillBadge} testID="prefill-badge">
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
        onChangeText={onBuyerNameChange}
        placeholder="Nama sesuai KTP"
        testID="buyer-name"
        editable={!buyerNameLocked}
        invalid={Boolean(buyerNameError)}
        errorMessage={buyerNameError}
        helperText={buyerNameHelperText}
      />
      <Field
        label="NIK Pembeli (16 digit)"
        value={buyerNik}
        onChangeText={onBuyerNikChange}
        placeholder="16 digit KTP pembeli"
        keyboardType="number-pad"
        testID="buyer-nik"
        editable={!buyerNikLocked}
        invalid={Boolean(buyerNikError)}
        errorMessage={buyerNikError}
        helperText={buyerNikHelperText}
      />
      <Field
        label="Email"
        value={buyerEmail}
        onChangeText={onBuyerEmailChange}
        placeholder="kamu@email.com"
        keyboardType="email-address"
        testID="buyer-email"
        editable={!buyerEmailLocked}
        invalid={Boolean(buyerEmailError)}
        errorMessage={buyerEmailError}
        helperText={buyerEmailHelperText}
      />
      <Field
        label="Konfirmasi email"
        value={emailConfirmation}
        onChangeText={onEmailConfirmationChange}
        placeholder="Masukkan kembali email"
        keyboardType="email-address"
        testID="buyer-email-confirmation"
        editable={!buyerEmailLocked}
        invalid={Boolean(emailConfirmationError)}
        errorMessage={emailConfirmationError}
        helperText={emailConfirmationHelperText}
      />
    </Section>
  );
}

interface CheckoutTicketFieldsProps {
  readonly rows: readonly TicketRow[];
  readonly buyerName: string;
  readonly buyerNik: string;
  readonly submitAttempted: boolean;
  readonly validationRows: CheckoutIssues["rows"];
  readonly checks: Readonly<Record<string, AttendeeCheckResult>>;
  readonly pending: Readonly<Record<string, boolean>>;
  readonly maxSelectable: number;
  readonly categories: BookingSession["categories"];
  readonly onAdd: () => void;
  readonly onRemove: (index: number) => void;
  readonly onPatch: (index: number, patch: Partial<TicketRow>) => void;
  readonly onUseBuyer: (index: number, enabled: boolean) => void;
}

function CheckoutTicketFields({
  rows,
  buyerName,
  buyerNik,
  submitAttempted,
  validationRows,
  checks,
  pending,
  maxSelectable,
  categories,
  onAdd,
  onRemove,
  onPatch,
  onUseBuyer,
}: CheckoutTicketFieldsProps) {
  return (
    <Section title="Tiket" number={2}>
      {rows.map((row, index) => {
        const nik = row.useBuyerNik ? buyerNik : row.attendeeNik;
        const rowIssues = validationRows[row.rowId] ?? {};
        const attendeeNikError = attendeeNikMessage(
          submitAttempted || Boolean(nik) ? rowIssues.attendeeNik : undefined,
          row.useBuyerNik,
        );
        return (
          <ValidationTarget key={row.rowId} id={`ticket-row-${index}`}>
            <TicketItem
              index={index}
              row={row}
              buyerName={buyerName}
              buyerNik={buyerNik}
              categoryError={
                submitAttempted && rowIssues.category
                  ? "Pilih kategori tiket."
                  : undefined
              }
              attendeeNameError={
                submitAttempted && rowIssues.attendeeName
                  ? "Nama penonton wajib diisi."
                  : undefined
              }
              attendeeNikError={attendeeNikError}
              canRemove={rows.length > 1}
              onRemove={() => onRemove(index)}
              onPatch={(patch) => onPatch(index, patch)}
              onUseBuyer={(enabled) => onUseBuyer(index, enabled)}
              showBuyerDataControl={canUseBuyerDataForTicket(index)}
              status={rowStatus(checks[nik], Boolean(pending[nik]))}
              categories={categories}
            />
          </ValidationTarget>
        );
      })}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tambah tiket"
        accessibilityState={{ disabled: rows.length >= maxSelectable }}
        disabled={rows.length >= maxSelectable}
        onPress={onAdd}
        testID="add-ticket"
        style={addTicketButtonStyle(rows, maxSelectable)}
      >
        <View className="flex-row items-center gap-2">
          <PlusIcon color={designColors.ink} size={16} />
          <Text style={componentStyles.addTicketLabel}>Tambah tiket</Text>
        </View>
      </Pressable>
      <View style={componentStyles.quotaWarning}>
        <WarningIcon color={designColors.warn} />
        <Text style={componentStyles.quotaWarningText}>
          Batas{" "}
          <Text style={componentStyles.quotaWarningEmphasis}>
            {maxSelectable} tiket per NIK
          </Text>{" "}
          divalidasi server saat Lanjut Bayar. Tiap tiket butuh 1 NIK penonton.
        </Text>
      </View>
    </Section>
  );
}

interface CheckoutConsentSectionProps {
  readonly visible: boolean;
  readonly consent: boolean;
  readonly errorMessage?: string;
  readonly onToggle: (checked: boolean) => void;
  readonly onOpenPrivacy: () => void;
}

function expiryRetryLabel(isChecking: boolean, isOffline: boolean): string {
  if (isChecking) return "MEMERIKSA…";
  if (isOffline) return "MENUNGGU KONEKSI";
  return "PERIKSA STATUS";
}

function CheckoutConsentSection({
  visible,
  consent,
  errorMessage,
  onToggle,
  onOpenPrivacy,
}: CheckoutConsentSectionProps) {
  if (!visible) return null;
  return (
    <Section title="Persetujuan" number={3}>
      <ConsentGate
        checked={consent}
        onToggle={onToggle}
        onOpenPrivacy={onOpenPrivacy}
        errorMessage={errorMessage}
      />
    </Section>
  );
}

export function CheckoutScreen({ sessionId }: CheckoutScreenProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDesktop, isMobileWeb } = useResponsive();
  const { serverClock } = useServices();
  const clearQueueMembership = useClearQueueMembership();
  const { cancel: cancelBookingSession } = useCancelBookingSession();
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
  const connectivity = useConnectivity();
  const setOrderDetail = useSessionStore((s) => s.setOrderDetail);
  // Select the STABLE profile reference (not a fresh object) so zustand does not
  // re-render every tick; derive the prefill from it with useMemo.
  const profile = useAccountStore((s) => s.profile);
  const accountEmail = useAccountStore((s) => s.buyerEmail);
  const { details: checkoutDetails, hasAuthToken } =
    useCheckoutAccountDetails();
  const prefill = useMemo(
    () => prefillFromProfile(profile, accountEmail),
    [profile, accountEmail],
  );
  const [buyerName, setBuyerName] = useState(prefill.fullName ?? "");
  const [buyerNik, setBuyerNik] = useState("");
  const [buyerEmail, setBuyerEmail] = useState(prefill.email ?? "");
  const [emailConfirmation, setEmailConfirmation] = useState(
    prefill.email ?? "",
  );
  const [leaveError, setLeaveError] = useState("");
  const [rows, setRows] = useState<TicketRow[]>([emptyRow("")]);
  const [consent, setConsent] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [authRecoveryOpen, setAuthRecoveryOpen] = useState(false);
  const [expiryCheckPending, setExpiryCheckPending] = useState(false);
  const [expiryCheckError, setExpiryCheckError] = useState<string>();
  const expiryCheckInFlight = useRef(false);
  const handledExpiredHold = useRef<string | null>(null);
  const reconnectExpiryCheckHandled = useRef(false);
  // Logged-in users consented at registration; guests consent inline (AC3).
  const isAccountUser = isAccountCheckout(
    prefill.fromAccount,
    hasAuthToken,
    checkoutDetails !== null,
  );
  const isGuest = !isAccountUser;

  useEffect(() => {
    if (checkoutDetails?.fullName?.trim())
      setBuyerName((current) => current || checkoutDetails.fullName || "");
    if (checkoutDetails?.nik)
      setBuyerNik(normalizeNikInput(checkoutDetails.nik));
    if (checkoutDetails?.email.trim()) {
      setBuyerEmail((current) => current || checkoutDetails.email.trim());
      setEmailConfirmation(
        (current) => current || checkoutDetails.email.trim(),
      );
    }
  }, [checkoutDetails]);

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

  const checkSessionExpiry = useCallback(async (): Promise<void> => {
    if (expiryCheckInFlight.current) return;
    if (connectivity.isOffline) {
      setExpiryCheckError(
        "Koneksi terputus. Status sesi akan diperiksa saat koneksi kembali.",
      );
      return;
    }
    expiryCheckInFlight.current = true;
    setExpiryCheckPending(true);
    setExpiryCheckError(undefined);
    try {
      const result = (await retry()) as {
        data?: BookingSession | null;
        isError?: boolean;
        error?: Error | null;
      };
      if (result.isError) throw result.error ?? new Error("Status unavailable");
      const latest = result.data;
      if (!latest || latest.phase === "ENDED") {
        await clearQueueMembership();
        router.replace("/" as Href);
        return;
      }
      if (latest.serverTime) serverClock.sync(latest.serverTime);
      if (serverClock.remaining(latest.expiresAt) <= 0) {
        await clearQueueMembership();
        router.replace("/" as Href);
      }
    } catch (error) {
      setExpiryCheckError(
        apiErrorMessage(
          error,
          "Status sesi belum dapat dipastikan. Coba lagi setelah koneksi tersedia.",
        ),
      );
    } finally {
      expiryCheckInFlight.current = false;
      setExpiryCheckPending(false);
    }
  }, [
    clearQueueMembership,
    connectivity.isOffline,
    retry,
    router,
    serverClock,
  ]);

  const { remainingMs, expired } = useServerCountdown({
    clock: serverClock,
    expiresAtIso: session?.expiresAt,
    serverTimeIso: session?.serverTime,
    onExpire: () => void checkSessionExpiry(),
  });

  useEffect(() => {
    if (!connectivity.justReconnected) {
      reconnectExpiryCheckHandled.current = false;
      return;
    }
    if (
      !reconnectExpiryCheckHandled.current &&
      (expiryCheckError !== undefined || expired)
    ) {
      reconnectExpiryCheckHandled.current = true;
      void checkSessionExpiry();
    }
  }, [
    checkSessionExpiry,
    connectivity.justReconnected,
    expired,
    expiryCheckError,
  ]);

  useEffect(() => {
    if (isExpiredSessionError(sessionError)) {
      let active = true;
      void clearQueueMembership()
        .then(() => {
          if (active) router.replace("/" as Href);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }
  }, [clearQueueMembership, router, sessionError, sessionId]);

  useEffect(() => {
    if (!isNewExpiredHoldError(holdError, handledExpiredHold.current)) return;

    handledExpiredHold.current = holdError.code;
    let active = true;
    void clearQueueMembership()
      .catch(() => undefined)
      .finally(() => {
        resetError();
        if (active) router.replace("/" as Href);
      });
    return () => {
      active = false;
    };
  }, [clearQueueMembership, holdError, resetError, router]);

  // Guests must tick the inline consent; logged-in users already consented.
  const consentGiven = isGuest ? consent : true;

  const sessionCategories = session?.categories;
  useEffect(() => {
    if (!sessionCategories) return;
    setRows((current) =>
      reconcileCheckoutCategories(current, sessionCategories),
    );
  }, [sessionCategories]);

  // A ticket using buyer identity resolves to the current buyer name + NIK.
  // Keep the attendee's own fields untouched so switching the option off
  // restores the identity they had entered for that ticket.
  const resolvedBuyerNik = buyerNik;
  const resolvedRows = useMemo(
    () => resolveBuyerTicketRows(rows, buyerName, resolvedBuyerNik),
    [rows, buyerName, resolvedBuyerNik],
  );

  const validation = useMemo(
    () =>
      validateCheckout({
        buyerName,
        buyerNik: resolvedBuyerNik,
        buyerEmail,
        emailConfirmation,
        rows,
        maxSelectable: cap,
        attendeeChecks: checks,
        consentGiven,
      }),
    [
      buyerName,
      resolvedBuyerNik,
      buyerEmail,
      emailConfirmation,
      rows,
      cap,
      checks,
      consentGiven,
    ],
  );
  const ready = validation.isValid;
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [focusTarget, setFocusTarget] = useState<string>();
  const invalidRowIndex = rows.findIndex(
    (row) => Object.keys(validation.rows[row.rowId] ?? {}).length > 0,
  );
  const invalidRow = validation.rows[rows[invalidRowIndex]?.rowId];
  const validationTarget = validation.buyerName
    ? "buyer-name"
    : validation.buyerNik
      ? "buyer-nik"
      : validation.buyerEmail
        ? "buyer-email"
        : validation.emailConfirmation
          ? "buyer-email-confirmation"
          : invalidRow?.category
            ? `ticket-row-${invalidRowIndex}`
            : invalidRow?.attendeeName
              ? `attendee-name-${invalidRowIndex}`
              : invalidRow?.attendeeNik
                ? `attendee-nik-${invalidRowIndex}`
                : validation.consent
                  ? "checkout-consent-target"
                  : undefined;
  const validationFocus = useMemo(
    () => ({
      target: focusTarget,
      attempt: validationAttempt,
      reveal: (view: View, input?: import("react-native").TextInput | null) => {
        if (!contentRef.current) return;
        view.measureLayout(contentRef.current, (_x, y) => {
          input?.focus();
          scrollRef.current?.scrollTo({
            y: Math.max(0, y - 16),
            animated: true,
          });
        });
      },
    }),
    [focusTarget, validationAttempt],
  );

  const buyerNameError = buyerNameValidationMessage(
    submitAttempted ? validation.buyerName : undefined,
  );
  const buyerNikError = requiredOrInvalidNikMessage(
    submitAttempted || Boolean(buyerNik) ? validation.buyerNik : undefined,
    "pembeli",
  );
  const buyerEmailError = requiredOrInvalidEmailMessage(
    submitAttempted || Boolean(buyerEmail) ? validation.buyerEmail : undefined,
  );
  const emailConfirmationError = emailConfirmationMessage(
    submitAttempted || Boolean(emailConfirmation)
      ? validation.emailConfirmation
      : undefined,
  );
  const buyerNikHelperText = buyerNikHelperMessage(
    Boolean(checkoutDetails?.nik),
    isAccountUser,
  );
  const buyerEmailHelperText = buyerEmailHelperMessage(
    Boolean(checkoutDetails?.email),
    isAccountUser,
    prefill.emailMasked,
    Boolean(prefill.email),
  );
  const buyerNameHelperText = checkoutDetails?.fullName?.trim()
    ? "Nama diisi dari akun dan tidak dapat diubah di sini."
    : undefined;
  const emailConfirmationHelperText = checkoutDetails?.email
    ? "Konfirmasi mengikuti email akun dan tidak dapat diubah."
    : undefined;
  const consentErrorMessage =
    submitAttempted && validation.consent
      ? "Persetujuan diperlukan sebelum melanjutkan."
      : undefined;

  const totalMinor = useMemo(
    () => checkoutTotalMinor(rows, session?.categories ?? []),
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
        emptyRow(defaultCheckoutCategory(session?.categories ?? [])),
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
    if (!ready) {
      setFocusTarget(validationTarget);
      setValidationAttempt((attempt) => attempt + 1);
      return;
    }
    // The hold use case keeps one idempotency key across dependency retries.
    void (async () => {
      try {
        const booking = await hold({
          sessionId,
          rows: resolvedRows,
          buyerNik,
          buyer: {
            nik: buyerNik,
            email: buyerEmail.trim(),
            emailConfirmation: emailConfirmation.trim(),
            consent: consentGiven,
          },
        });
        setOrderDetail(maskNik(buyerNik), rows.length);
        router.replace(`/payment/${booking.bookingId}` as Href);
      } catch {
        // holdError (DomainError.userMessage) is shown in CheckoutBar; stay on
        // this screen so the user can recover or retry the same action.
      }
    })();
  };

  const holdErrorAction = holdErrorActionLabel(holdError?.kind);
  const handleHoldErrorAction = (): void =>
    runHoldErrorAction(
      holdError?.kind,
      resetError,
      () => setAuthRecoveryOpen(true),
      handleSubmit,
    );

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

  if (!hasRestoredSession(session, sessionId)) {
    return (
      <CheckoutSessionUnavailable
        hasError={Boolean(sessionError)}
        errorMessage={sessionErrorMessage(sessionError)}
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
        <ConnectivityBanner
          isOffline={connectivity.isOffline}
          justReconnected={connectivity.justReconnected}
          detail={
            expiryCheckPending
              ? "Waktu sesi lokal sudah habis. Menunggu konfirmasi server saat koneksi kembali."
              : "Koneksi terputus. Formulir tetap tersedia selama aplikasi terbuka; NIK perlu dimasukkan kembali jika aplikasi dimulai ulang."
          }
        />
        {expiryCheckError ? (
          <View className="flex-row items-center justify-between gap-3 border-b-2 border-ink bg-background px-4 py-3">
            <Text className="flex-1 text-sm">{expiryCheckError}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Periksa status sesi"
              disabled={expiryCheckPending || connectivity.isOffline}
              onPress={() => void checkSessionExpiry()}
              testID="checkout-expiry-retry"
              className="min-h-11 justify-center border-2 border-ink px-3"
            >
              <Text className="text-xs font-bold">
                {expiryRetryLabel(expiryCheckPending, connectivity.isOffline)}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Progress Steps Bar (prototype .progress-container) */}
        <ProgressSteps currentStep={3} />

        <CheckoutValidationFocus.Provider value={validationFocus}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={checkoutScrollContent(
              isDesktop,
              isMobileWeb,
            )}
            testID="checkout-scroll"
          >
            <View ref={contentRef} collapsable={false}>
              <CheckoutHero
                eventId={session.eventId}
                eventName={eventDetail?.name}
                eventNameError={eventDetailError}
                isMobileWeb={isMobileWeb}
                onRetryEventName={() => void retryEventDetail()}
              />

              <CheckoutBuyerFields
                isAccountUser={isAccountUser}
                buyerName={buyerName}
                onBuyerNameChange={setBuyerName}
                buyerNameError={buyerNameError}
                buyerNameHelperText={buyerNameHelperText}
                buyerNameLocked={Boolean(checkoutDetails?.fullName?.trim())}
                buyerNik={buyerNik}
                onBuyerNikChange={(value) =>
                  setBuyerNik(normalizeNikInput(value))
                }
                buyerNikError={buyerNikError}
                buyerNikHelperText={buyerNikHelperText}
                buyerNikLocked={Boolean(checkoutDetails?.nik)}
                buyerEmail={buyerEmail}
                onBuyerEmailChange={setBuyerEmail}
                buyerEmailError={buyerEmailError}
                buyerEmailHelperText={buyerEmailHelperText}
                buyerEmailLocked={Boolean(checkoutDetails?.email)}
                emailConfirmation={emailConfirmation}
                onEmailConfirmationChange={setEmailConfirmation}
                emailConfirmationError={emailConfirmationError}
                emailConfirmationHelperText={emailConfirmationHelperText}
              />

              <CheckoutTicketFields
                rows={rows}
                buyerName={buyerName}
                buyerNik={buyerNik}
                submitAttempted={submitAttempted}
                validationRows={validation.rows}
                checks={checks}
                pending={pending}
                maxSelectable={cap}
                categories={session.categories}
                onAdd={addRow}
                onRemove={removeRow}
                onPatch={patchRow}
                onUseBuyer={setUseBuyer}
              />

              <ValidationTarget id="checkout-consent-target">
                <CheckoutConsentSection
                  visible={isGuest}
                  consent={consent}
                  onToggle={setConsent}
                  onOpenPrivacy={() => router.push("/privacy" as Href)}
                  errorMessage={consentErrorMessage}
                />
              </ValidationTarget>
            </View>
          </ScrollView>
        </CheckoutValidationFocus.Provider>

        <CheckoutBar
          totalMinor={totalMinor}
          pending={isHolding}
          expired={expired}
          errorMessage={
            holdError?.userMessage ??
            (leaveError || undefined) ??
            (submitAttempted && !ready
              ? "Lengkapi data yang ditandai sebelum lanjut bayar."
              : undefined)
          }
          errorActionLabel={holdErrorAction}
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
                await cancelBookingSession(sessionId);
                await clearQueueMembership();
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
