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
import { useNavigation, useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlusIcon, WarningIcon } from "@presentation/components/ArrowIcon";
import { DomainError } from "@domain/errors/domain-error";
import type { BookingSession } from "@domain/repositories/booking.repository";
import type { DomainErrorKind } from "@domain/errors/domain-error";

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
import { ConnectivityBanner } from "@presentation/components/ConnectivityBanner";
import { designColors } from "@presentation/theme";

import { useAttendeeCheck } from "@presentation/hooks/useAttendeeCheck";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { useRestoreBookingSession } from "@presentation/hooks/useBookingSession";
import { useServerCountdown } from "@presentation/hooks/useServerCountdown";
import { useHoldBooking } from "@presentation/hooks/useHoldBooking";
import { useConnectivity } from "@presentation/hooks/useConnectivity";
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
import {
  checkoutScrollContent,
  componentStyles,
  addTicketButtonStyle,
} from "./style";

import { apiErrorMessage } from "@presentation/utils/api-error-message";
import { LoginModal } from "@presentation/components/auth/LoginModal";
import { GetCheckoutUserDetails } from "@application/auth/get-checkout-user-details.use-case";
import type { CheckoutUserDetails } from "@domain/repositories/user.repository";

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
  submitAttempted: boolean,
  nik: string,
  subject: "pembeli" | "penonton",
): string | undefined {
  if (nik.length > 0 && !isValidNik(nik))
    return `NIK ${subject} harus terdiri dari 16 digit.`;
  if (submitAttempted && !nik.trim())
    return `NIK ${subject} wajib diisi (16 digit).`;
  return undefined;
}

function requiredOrInvalidEmailMessage(
  submitAttempted: boolean,
  email: string,
): string | undefined {
  if (email.length > 0 && !isValidEmail(email))
    return email.trim()
      ? "Masukkan alamat email yang valid."
      : "Email wajib diisi.";
  if (submitAttempted && !email.trim()) return "Email wajib diisi.";
  return undefined;
}

function emailConfirmationMessage(
  submitAttempted: boolean,
  confirmation: string,
  email: string,
): string | undefined {
  if (confirmation.length > 0 && confirmation.trim() !== email.trim())
    return "Konfirmasi email harus sama dengan email pembeli.";
  if (submitAttempted && !confirmation.trim())
    return "Konfirmasi email wajib diisi.";
  return undefined;
}

function isAccountCheckout(
  fromAccount: boolean,
  hasAuthToken: boolean,
  checkoutDetails: CheckoutUserDetails | null,
): boolean {
  return fromAccount || hasAuthToken || checkoutDetails !== null;
}

function buyerNameValidationMessage(
  submitAttempted: boolean,
  required: boolean,
  buyerName: string,
): string | undefined {
  return submitAttempted && required && !buyerName.trim()
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

function attendeeNikMessage(
  submitAttempted: boolean,
  nik: string,
  useBuyerNik: boolean,
  attendeeNiksAreUnique: boolean,
): string | undefined {
  if (submitAttempted && !isValidNik(nik)) {
    return useBuyerNik
      ? "Masukkan NIK pembeli yang valid pada bagian Data Pembeli."
      : "NIK penonton wajib diisi (16 digit).";
  }
  if (!isValidNik(nik) && nik.length > 0)
    return "NIK penonton harus terdiri dari 16 digit.";
  if (submitAttempted && !attendeeNiksAreUnique)
    return "NIK ini sudah digunakan pada tiket lain.";
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
  readonly attendeeNiksAreUnique: boolean;
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
  attendeeNiksAreUnique,
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
        const attendeeNikError = attendeeNikMessage(
          submitAttempted,
          nik,
          row.useBuyerNik,
          attendeeNiksAreUnique,
        );
        return (
          <TicketItem
            key={row.rowId}
            index={index}
            row={row}
            buyerName={buyerName}
            buyerNik={buyerNik}
            categoryError={
              submitAttempted && !row.categoryId
                ? "Pilih kategori tiket."
                : undefined
            }
            attendeeNameError={
              submitAttempted && !row.useBuyerNik && !row.attendeeName.trim()
                ? "Nama penonton wajib diisi."
                : undefined
            }
            attendeeNikError={attendeeNikError}
            canRemove={rows.length > 1}
            onRemove={() => onRemove(index)}
            onPatch={(patch) => onPatch(index, patch)}
            onUseBuyer={(enabled) => onUseBuyer(index, enabled)}
            status={rowStatus(checks[nik], Boolean(pending[nik]))}
            categories={categories}
          />
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
  const {
    serverClock,
    bookingRepository,
    queueMembership,
    tokenStorage,
    userRepository,
  } = useServices();
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
  const getCheckoutUserDetails = useMemo(
    () => new GetCheckoutUserDetails(userRepository),
    [userRepository],
  );
  const prefill = useMemo(
    () => prefillFromProfile(profile, accountEmail),
    [profile, accountEmail],
  );
  const [buyerName, setBuyerName] = useState(prefill.fullName ?? "");
  const [buyerNik, setBuyerNik] = useState("");
  const [checkoutDetails, setCheckoutDetails] =
    useState<CheckoutUserDetails | null>(null);
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
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const [expiryCheckPending, setExpiryCheckPending] = useState(false);
  const [expiryCheckError, setExpiryCheckError] = useState<string>();
  const expiryCheckInFlight = useRef(false);
  const reconnectExpiryCheckHandled = useRef(false);
  const checkoutDetailsRequestStarted = useRef(false);
  // Logged-in users consented at registration; guests consent inline (AC3).
  const isAccountUser = isAccountCheckout(
    prefill.fromAccount,
    hasAuthToken,
    checkoutDetails,
  );
  const isGuest = !isAccountUser;

  // Fetch authenticated /me data specifically for checkout. The raw NIK stays
  // in this mounted screen's state and is never placed in shared/persisted
  // account storage. Guests continue with manual entry.
  useEffect(() => {
    if (checkoutDetailsRequestStarted.current) return;
    let active = true;
    void (async () => {
      try {
        const token = await tokenStorage.load();
        if (!token || !active) return;
        checkoutDetailsRequestStarted.current = true;
        setHasAuthToken(true);
        const details = await getCheckoutUserDetails.execute();
        if (active) {
          setCheckoutDetails(details);
          if (details.fullName?.trim()) setBuyerName(details.fullName);
          if (details.nik) {
            setBuyerNik(details.nik.replace(/\D/g, "").slice(0, 16));
          }
          if (details.email.trim()) {
            setBuyerEmail(details.email.trim());
            setEmailConfirmation(details.email.trim());
          }
        }
      } catch {
        checkoutDetailsRequestStarted.current = false;
        // Keep manual checkout available if /me is unavailable or the session
        // has expired; the booking API remains authoritative.
      }
    })();
    return () => {
      active = false;
    };
  }, [getCheckoutUserDetails, prefill.fromAccount, tokenStorage]);

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
        void queueMembership.clear().catch(() => undefined);
        router.replace(
          `/failed/${sessionId}?reason=hold&eventId=${encodeURIComponent(session?.eventId ?? "")}` as Href,
        );
        return;
      }
      if (latest.serverTime) serverClock.sync(latest.serverTime);
      if (serverClock.remaining(latest.expiresAt) <= 0) {
        void queueMembership.clear().catch(() => undefined);
        router.replace(
          `/failed/${sessionId}?reason=hold&eventId=${encodeURIComponent(latest.eventId)}` as Href,
        );
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
    connectivity.isOffline,
    queueMembership,
    retry,
    router,
    serverClock,
    session?.eventId,
    sessionId,
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
  const resolvedBuyerNik = buyerNik;
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
        buyerEmail,
        rows: resolvedRows,
        maxSelectable: cap,
        attendeeChecks: checks,
        consentGiven,
      }),
    [
      resolvedBuyerNik,
      buyerEmail,
      emailConfirmation,
      resolvedRows,
      cap,
      checks,
      consentGiven,
    ],
  );

  const buyerNameRequired = rows.some((row) => row.useBuyerNik);
  const buyerNameError = buyerNameValidationMessage(
    submitAttempted,
    buyerNameRequired,
    buyerName,
  );
  const buyerNikError = requiredOrInvalidNikMessage(
    submitAttempted,
    buyerNik,
    "pembeli",
  );
  const buyerEmailError = requiredOrInvalidEmailMessage(
    submitAttempted,
    buyerEmail,
  );
  const emailConfirmationError = emailConfirmationMessage(
    submitAttempted,
    emailConfirmation,
    buyerEmail,
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
  const attendeeNiksAreUnique = attendeeNiksUnique(
    resolvedRows,
    resolvedBuyerNik,
  );
  const consentErrorMessage =
    submitAttempted && !consent
      ? "Persetujuan diperlukan sebelum melanjutkan."
      : undefined;

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

  const handleSubmit = (): void => {
    setSubmitAttempted(true);
    if (!ready) return;
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
                {expiryCheckPending
                  ? "MEMERIKSA…"
                  : connectivity.isOffline
                    ? "MENUNGGU KONEKSI"
                    : "PERIKSA STATUS"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Progress Steps Bar (prototype .progress-container) */}
        <ProgressSteps currentStep={3} />

        <ScrollView
          contentContainerStyle={checkoutScrollContent(isDesktop, isMobileWeb)}
          testID="checkout-scroll"
        >
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
              setBuyerNik(value.replace(/\D/g, "").slice(0, 16))
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
            attendeeNiksAreUnique={attendeeNiksAreUnique}
            checks={checks}
            pending={pending}
            maxSelectable={cap}
            categories={session.categories}
            onAdd={addRow}
            onRemove={removeRow}
            onPatch={patchRow}
            onUseBuyer={setUseBuyer}
          />

          <CheckoutConsentSection
            visible={isGuest}
            consent={consent}
            onToggle={setConsent}
            onOpenPrivacy={() => router.push("/privacy" as Href)}
            errorMessage={consentErrorMessage}
          />
        </ScrollView>

        <CheckoutBar
          totalMinor={totalMinor}
          pending={isHolding}
          expired={expired}
          errorMessage={holdError?.userMessage ?? (leaveError || undefined)}
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
