/**
 * LoginModal —  Brutalist Mono OTP Authentication Modal
 *
 * MATCHES: `.genesis/prototype/v2/01-home.html` lines ~1359-1520 (CSS),
 * ~2100-2250 (HTML), ~2700-2900 (JS).
 *
 *  Design Rules:
 * - Colors and surfaces come from the shared green-and-yellow theme tokens.
 * - Fonts: Plus Jakarta Sans (weight 800 for titles, 700 for labels/buttons)
 * - Animation: modalIn (translateY 20→0, scale 0.95→1, opacity 0→1, 400ms)
 *
 * Steps (prototype flow):
 *   loginStep1  -> "phone"    : enter phone/email, send OTP
 *   loginStep2  -> "otp"      : 6 separate OTP digit boxes, verify
 *   loginStep3  -> "success"  : success confirmation
 *   lgRegStep   -> "register" : NEW user → name + NIK + consent (RBT-021)
 *   lgSignedStep-> "signed"   : returning user profile panel
 *
 * Sign-in is OPTIONAL (D8.5): modal can be dismissed at any time.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { NIK_LENGTH, validateNik } from "@domain/auth/nik";
import { DomainError } from "@domain/errors/domain-error";
import { MAX_TICKETS } from "@domain/rules/checkout";
import {
  EMAIL_ERROR,
  isValidCode,
  isValidEmail,
} from "@presentation/components/auth/auth.schema";
import { useAuth } from "@presentation/hooks/useAuth";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { CheckIcon, CloseIcon } from "@presentation/components/ArrowIcon";
import {
  designColors,
  designDuration,
} from "@presentation/theme/event-design-tokens";

import { loginStyles as styles, componentStyles } from "./style";
import { nativeDriverSupported } from "@presentation/utils/style";
import { GhostButton } from "./GhostButton";
import { PrimaryButton } from "./PrimaryButton";
import {
  styleForLoginModalView0,
  styleForLoginModalAnimatedView1,
  styleForLoginModalPressable2,
  styleForLoginModalText3,
  styleForLoginModalView4,
} from "./style";

type Step = "phone" | "otp" | "register" | "success" | "signed";

export interface LoginModalProps {
  /** Whether the modal is open. */
  readonly visible: boolean;
  /** Close request (backdrop, Escape, "Batal"/"Tutup"). */
  readonly onClose: () => void;
}

/** Surface a typed DomainError's Bahasa message, else a prototype fallback. */
function messageFor(error: Error | null, fallback: string): string {
  if (error instanceof DomainError) return error.userMessage;
  return fallback;
}

/** First-letter avatar initial. */
function initialOf(name: string | undefined, emailMasked: string): string {
  const source = (name ?? emailMasked ?? "").trim();
  return source.length > 0 ? source.charAt(0).toUpperCase() : "B";
}

/** Resend OTP cooldown in seconds (prototype: 60s). */
const RESEND_COOLDOWN = 60;

export function LoginModal({
  visible,
  onClose,
}: LoginModalProps): React.ReactElement | null {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  const [step, setStep] = useState<Step>("phone");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);

  // OTP as array of 6 digits
  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Resend timer
  const [resendTimer, setResendTimer] = useState(0);
  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Register step (RBT-021)
  const [regName, setRegName] = useState("");
  const [regNik, setRegNik] = useState("");
  const [regConsent, setRegConsent] = useState(false);
  const [regNikError, setRegNikError] = useState("");
  const [regDoneName, setRegDoneName] = useState("");

  const auth = useAuth();
  const { isMobileWeb } = useResponsive();
  const emailInputRef = useRef<TextInput>(null);
  const regNameInputRef = useRef<TextInput>(null);

  // Compose OTP code from digits
  const otpCode = otpDigits.join("");
  const canVerify = isValidCode(otpCode);

  // ---------------------------------------------------------------------------
  // Animation: modal entrance (prototype: modalIn 0.4s)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (visible) {
      // Reset animation values
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
      translateYAnim.setValue(20);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: designDuration.slow, // 500ms ≈ 400ms
          useNativeDriver: nativeDriverSupported(),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: designDuration.slow,
          useNativeDriver: nativeDriverSupported(),
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: designDuration.slow,
          useNativeDriver: nativeDriverSupported(),
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, translateYAnim]);

  // Reset flow when modal opens
  useEffect(() => {
    if (visible) {
      setStep("phone");
      setEmail("");
      setEmailError("");
      setOtpDigits(["", "", "", "", "", ""]);
      setResendTimer(0);
      setRegName("");
      setRegNik("");
      setRegConsent(false);
      setRegNikError("");
      setRegDoneName("");
      auth.reset();
      // Android's soft keyboard resizes transparent Modal windows. Focusing on
      // open can move the sheet under the keyboard before the user sees it;
      // let native users open the keyboard by choosing the field. Web retains
      // the prototype's focus-on-open behavior.
      if (Platform.OS === "web") {
        setTimeout(() => emailInputRef.current?.focus(), 500);
      }
    }
    return () => {
      if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!visible || Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        close();
        return true;
      },
    );
    return () => subscription.remove();
  }, [close, visible]);

  // ---------------------------------------------------------------------------
  // Step 1: Phone/Email → send OTP
  // ---------------------------------------------------------------------------
  const onSendOtp = useCallback(async () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setEmailError(EMAIL_ERROR);
      return;
    }
    setEmailError("");
    try {
      await auth.requestOtp(trimmed);
      setEmail(trimmed);
      setOtpDigits(["", "", "", "", "", ""]);
      setStep("otp");
      // Start resend timer
      setResendTimer(RESEND_COOLDOWN);
      resendIntervalRef.current = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            if (resendIntervalRef.current)
              clearInterval(resendIntervalRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      // Avoid bringing up Android's keyboard while the sheet is transitioning.
      if (Platform.OS === "web") {
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch {
      // Error surfaced via auth.requestError
    }
  }, [auth, email]);

  // ---------------------------------------------------------------------------
  // OTP digit handling (6 separate boxes like prototype)
  // ---------------------------------------------------------------------------
  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      // Only allow single digit
      const digit = value.replace(/\D/g, "").slice(-1);
      const newDigits = [...otpDigits];
      newDigits[index] = digit;
      setOtpDigits(newDigits);

      // Auto-advance to next box
      if (digit && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    },
    [otpDigits],
  );

  const handleOtpKeyPress = useCallback(
    (index: number, key: string) => {
      // Handle backspace to go to previous box
      if (key === "Backspace" && !otpDigits[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otpDigits],
  );

  // ---------------------------------------------------------------------------
  // Step 2: Verify OTP
  // ---------------------------------------------------------------------------
  const onVerify = useCallback(async () => {
    try {
      const session = await auth.verifyOtp({ email, code: otpCode });
      if (session.isNew) {
        // NEW user → registration step
        setRegName("");
        setRegNik("");
        setRegConsent(false);
        setRegNikError("");
        setStep("register");
        if (Platform.OS === "web") {
          setTimeout(() => regNameInputRef.current?.focus(), 50);
        }
      } else {
        // Returning user → signed-in panel
        setStep("signed");
      }
    } catch {
      // Error surfaced via auth.verifyError
    }
  }, [auth, email, otpCode]);

  const onResendOtp = useCallback(async () => {
    try {
      await auth.requestOtp(email);
      setOtpDigits(["", "", "", "", "", ""]);
      setResendTimer(RESEND_COOLDOWN);
      resendIntervalRef.current = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            if (resendIntervalRef.current)
              clearInterval(resendIntervalRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      otpRefs.current[0]?.focus();
    } catch {
      // Error handled
    }
  }, [auth, email]);

  const backToPhone = useCallback(() => {
    auth.reset();
    setOtpDigits(["", "", "", "", "", ""]);
    setStep("phone");
    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    setResendTimer(0);
  }, [auth]);

  // ---------------------------------------------------------------------------
  // Register step: name + NIK + consent
  // ---------------------------------------------------------------------------
  const nameOk = regName.trim().length >= 2;
  const nikOk = validateNik(regNik).ok;
  const canRegister = nameOk && nikOk && regConsent;

  const onChangeNik = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, NIK_LENGTH);
    setRegNik(digits);
    setRegNikError(
      digits.length > 0 && digits.length < NIK_LENGTH
        ? `NIK harus ${NIK_LENGTH} digit (${digits.length}/${NIK_LENGTH})`
        : "",
    );
  }, []);

  const onSubmitRegister = useCallback(async () => {
    setRegNikError("");
    try {
      const profile = await auth.completeRegistration({
        fullName: regName.trim(),
        nik: regNik,
      });
      setRegDoneName(profile.fullName ?? regName.trim());
      setRegNik(""); // Clear NIK immediately (SECURITY)
      setStep("success");
    } catch {
      // Error surfaced via auth.registerError
    }
  }, [auth, regName, regNik]);

  const modalBody = (
    <View
      style={[
        styles.overlay,
        isMobileWeb && styles.mobileWebOverlay,
        Platform.OS !== "web" && styleForLoginModalView0(),
      ]}
    >
      <Pressable
        testID="login-backdrop"
        accessibilityLabel="Tutup dialog"
        onPress={close}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Animated card */}
      <Animated.View
        style={styleForLoginModalAnimatedView1(
          fadeAnim,
          scaleAnim,
          translateYAnim,
          isMobileWeb,
        )}
      >
        <Pressable
          testID="login-card"
          accessible={false}
          accessibilityViewIsModal
          accessibilityRole={Platform.OS === "web" ? "none" : undefined}
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.card,
            isMobileWeb && styles.mobileWebCard,
            Platform.OS !== "web" && styleForLoginModalPressable2(),
          ]}
        >
          {/* Close button */}
          <Pressable
            testID="login-close"
            accessibilityLabel="Tutup"
            onPress={close}
            style={[styles.closeBtn, isMobileWeb && styles.mobileWebCloseBtn]}
          >
            <CloseIcon color={designColors.ink} />
          </Pressable>

          <ScrollView
            style={componentStyles.elementFlexShrink0}
            contentContainerStyle={
              Platform.OS === "web"
                ? undefined
                : { padding: 24, paddingTop: 72 }
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Step 1: Phone/Email */}
            {step === "phone" && (
              <View>
                <Text accessibilityRole="header" style={styles.title}>
                  Masuk / Daftar
                </Text>
                <Text style={styles.sub}>
                  Masukkan email untuk menerima kode OTP
                </Text>
                <View style={styles.fld}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    ref={emailInputRef}
                    testID="login-email-input"
                    accessibilityLabel="Email"
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (emailError) setEmailError("");
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="kamu@email.com"
                    placeholderTextColor={designColors.inkMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    style={[
                      styles.input,
                      emailFocused && styles.inputFocused,
                      emailError && styles.inputError,
                    ]}
                  />
                  <Text testID="login-email-error" style={styles.err}>
                    {emailError ||
                      (auth.requestError
                        ? messageFor(
                            auth.requestError,
                            "Terjadi kesalahan. Silakan coba lagi.",
                          )
                        : "")}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <GhostButton
                    testID="login-cancel"
                    label="Batal"
                    onPress={close}
                  />
                  <PrimaryButton
                    testID="login-send"
                    label={auth.isRequesting ? "Mengirim…" : "Kirim OTP"}
                    disabled={auth.isRequesting}
                    onPress={onSendOtp}
                  />
                </View>
              </View>
            )}

            {/* Step 2: OTP verification (6 separate boxes) */}
            {step === "otp" && (
              <View>
                <Text accessibilityRole="header" style={styles.title}>
                  Verifikasi OTP
                </Text>
                <Text style={styles.sub}>
                  Masukkan 6 digit kode yang dikirim ke{" "}
                  <Text style={styles.bold}>{email}</Text>
                </Text>

                <View style={styles.fld}>
                  <View
                    style={[
                      styles.otpRow,
                      isMobileWeb && styles.mobileWebOtpRow,
                    ]}
                  >
                    {otpDigits.map((digit, idx) => (
                      <TextInput
                        key={idx}
                        ref={(ref) => {
                          otpRefs.current[idx] = ref;
                        }}
                        testID={`login-otp-${idx}`}
                        value={digit}
                        onChangeText={(v) => handleOtpChange(idx, v)}
                        onKeyPress={({ nativeEvent }) =>
                          handleOtpKeyPress(idx, nativeEvent.key)
                        }
                        keyboardType="number-pad"
                        inputMode="numeric"
                        maxLength={1}
                        selectTextOnFocus
                        style={[
                          styles.otpBox,
                          isMobileWeb && styles.mobileWebOtpBox,
                          digit && styles.otpBoxFocused,
                        ]}
                      />
                    ))}
                  </View>
                  <Text testID="login-otp-error" style={styles.err}>
                    {auth.verifyError
                      ? messageFor(
                          auth.verifyError,
                          "Kode OTP salah atau kedaluwarsa.",
                        )
                      : ""}
                  </Text>
                  <Text style={styles.hint}>
                    Kode demo: <Text style={styles.bold}>123456</Text>
                  </Text>
                </View>

                {/* Resend timer */}
                <View style={styles.resendRow}>
                  <Text style={styles.resendText}>Tidak menerima kode? </Text>
                  <Pressable
                    testID="login-resend"
                    disabled={resendTimer > 0}
                    onPress={onResendOtp}
                    style={styles.resendBtn}
                  >
                    <Text
                      style={[
                        styles.resendBtnText,
                        resendTimer > 0 && styles.resendBtnDisabled,
                      ]}
                    >
                      {resendTimer > 0
                        ? `Kirim ulang (${resendTimer}s)`
                        : "Kirim ulang"}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.actions}>
                  <GhostButton
                    testID="login-change-email"
                    label="Ubah Email"
                    onPress={backToPhone}
                  />
                  <PrimaryButton
                    testID="login-verify"
                    label={auth.isVerifying ? "Memeriksa…" : "Verifikasi"}
                    disabled={!canVerify || auth.isVerifying}
                    onPress={onVerify}
                  />
                </View>
              </View>
            )}

            {/* Register step: name + NIK + consent */}
            {step === "register" && (
              <View>
                <Text accessibilityRole="header" style={styles.title}>
                  Lengkapi Pendaftaran
                </Text>
                <Text style={styles.sub}>
                  Email baru — isi data diri sekali saja untuk checkout
                  otomatis.
                </Text>

                {/* Email (verified, read-only) */}
                <View style={styles.fld}>
                  <Text style={styles.label}>Email (untuk e-tiket)</Text>
                  <TextInput
                    testID="login-reg-email"
                    accessibilityLabel="Email terverifikasi"
                    value={email}
                    editable={false}
                    style={[styles.input, styles.inputReadonly]}
                  />
                  <Text style={styles.hint}>
                    Sudah terverifikasi. E-tiket dikirim ke email ini.
                  </Text>
                </View>

                {/* Nama Lengkap */}
                <View style={styles.fld}>
                  <Text style={styles.label}>Nama Lengkap</Text>
                  <TextInput
                    ref={regNameInputRef}
                    testID="login-reg-name-input"
                    accessibilityLabel="Nama Lengkap"
                    value={regName}
                    onChangeText={setRegName}
                    placeholder="Nama sesuai KTP"
                    placeholderTextColor={designColors.inkMuted}
                    autoComplete="name"
                    textContentType="name"
                    style={styles.input}
                  />
                </View>

                {/* NIK */}
                <View style={styles.fld}>
                  <Text style={styles.label}>NIK (16 digit)</Text>
                  <TextInput
                    testID="login-reg-nik-input"
                    accessibilityLabel="NIK 16 digit"
                    value={regNik}
                    onChangeText={onChangeNik}
                    placeholder="16 digit KTP"
                    placeholderTextColor={designColors.inkMuted}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={NIK_LENGTH}
                    style={styles.input}
                  />
                  <Text testID="login-reg-nik-error" style={styles.err}>
                    {regNikError}
                  </Text>
                  <Text style={styles.hint}>
                    NIK dipakai untuk batas {MAX_TICKETS} tiket/NIK & divalidasi
                    server.
                  </Text>
                </View>

                {/* Consent */}
                <Pressable
                  testID="login-reg-consent"
                  accessibilityRole="checkbox"
                  accessibilityLabel="Setujui kebijakan privasi"
                  accessibilityState={{ checked: regConsent }}
                  onPress={() => setRegConsent((v) => !v)}
                  style={styles.consentRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      regConsent && styles.checkboxChecked,
                    ]}
                  >
                    {regConsent && (
                      <CheckIcon color={designColors.ground} size={14} />
                    )}
                  </View>
                  <Text style={styles.consentText}>
                    Saya menyetujui pemrosesan data sesuai{" "}
                    <Text style={styles.link}>Kebijakan Privasi</Text>.
                  </Text>
                </Pressable>

                <Text testID="login-reg-error" style={styles.err}>
                  {auth.registerError
                    ? messageFor(
                        auth.registerError,
                        "Pendaftaran gagal. Periksa data lalu coba lagi.",
                      )
                    : ""}
                </Text>

                <View style={styles.actions}>
                  <GhostButton
                    testID="login-reg-cancel"
                    label="Batal"
                    onPress={backToPhone}
                  />
                  <PrimaryButton
                    testID="login-reg-submit"
                    label={auth.isRegistering ? "Mendaftar…" : "Daftar & Masuk"}
                    disabled={!canRegister || auth.isRegistering}
                    onPress={onSubmitRegister}
                  />
                </View>
              </View>
            )}

            {/* Signed-in panel (returning user) */}
            {step === "signed" && (
              <View>
                <Text accessibilityRole="header" style={styles.title}>
                  Akun Kamu
                </Text>
                <View style={styles.signedin}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {initialOf(
                        auth.profile?.fullName,
                        auth.profile?.emailMasked ?? email,
                      )}
                    </Text>
                  </View>
                  <View>
                    <Text testID="login-signed-name" style={styles.signedName}>
                      {auth.profile?.fullName ?? "—"}
                    </Text>
                    <Text
                      testID="login-signed-email"
                      style={styles.signedEmail}
                    >
                      {auth.profile?.emailMasked ?? email}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.sub, styleForLoginModalText3()]}>
                  Data pembeli akan terisi otomatis saat checkout.
                </Text>
                <View style={styles.actions}>
                  <GhostButton
                    testID="login-close-signed"
                    label="Tutup"
                    onPress={close}
                  />
                  <PrimaryButton
                    testID="login-logout"
                    label="Keluar"
                    variant="danger"
                    onPress={close}
                  />
                </View>
              </View>
            )}

            {/* Success step (new registration complete) */}
            {step === "success" && (
              <View style={styles.doneContainer}>
                <View style={styles.doneCheck}>
                  <CheckIcon color={designColors.ground} size={28} />
                </View>
                <Text
                  accessibilityRole="header"
                  style={[styles.title, styles.doneTitle]}
                >
                  Berhasil!
                </Text>
                <Text style={[styles.sub, styles.doneSub]}>
                  Akun <Text style={styles.bold}>{regDoneName || "—"}</Text>{" "}
                  aktif. Data pembeli akan terisi otomatis saat checkout.
                </Text>
                <View style={[styles.actions, styles.doneActions]}>
                  <PrimaryButton
                    testID="login-done-close"
                    label="Cari Tiket"
                    onPress={close}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Animated.View>
    </View>
  );

  if (Platform.OS !== "web") {
    if (!visible) return null;
    // Keep the native sheet in the screen's own view tree. Android's transparent
    // Modal window can otherwise measure to the form contents and leave the
    // controls clipped above the screen while still intercepting all touches.
    return (
      <View style={[StyleSheet.absoluteFillObject, styleForLoginModalView4()]}>
        {modalBody}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={close}
    >
      {modalBody}
    </Modal>
  );
}
