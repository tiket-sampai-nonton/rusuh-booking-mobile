/**
 * LoginModal -- the landing "Masuk / Daftar" OTP modal (RBT-020).
 *
 * Rebuilt to match the prototype EXACTLY (`.genesis/prototype/Final/index.html`
 * `#lgBack` dialog, lines ~320-402 markup / ~137-162 styles / ~700-762 JS). This
 * is a MODAL launched from the Home landing -- NOT a route or standalone screen.
 *
 * Steps (prototype step ids -> local `step` state):
 *   lgEmailStep  -> "email"   : enter email, send OTP.
 *   lgCodeStep   -> "code"    : enter the 6-digit OTP, verify.
 *   lgSignedStep -> "signed"  : returning user -- masked account panel.
 *   lgRegStep    -> "register": NEW email handoff placeholder (RBT-021 builds the
 *                               real name+NIK form; here we only show the affordance).
 *
 * Sign-in is OPTIONAL and NON-BLOCKING (D8.5): the modal can be dismissed at any
 * time (backdrop / Escape / "Batal" / "Tutup") without completing sign-in.
 *
 * Boundaries: presentation only. Reaches the backend via `useAuth()` ->
 * use cases -> the `UserRepository` port; never imports infrastructure. The raw
 * OTP code and issued token are never logged. Validation is dependency-free
 * (see `auth.schema.ts`) -- no react-hook-form / zod.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { DomainError } from "@domain/errors/domain-error";
import {
  EMAIL_ERROR,
  isValidEmail,
  normalizeCode,
} from "@presentation/components/auth/auth.schema";
import { useAuth } from "@presentation/hooks/useAuth";
import { tokens } from "@presentation/theme/tokens";

type Step = "email" | "code" | "signed" | "register";

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

/** First-letter avatar initial, mirroring the prototype `#lgAv`. */
function initialOf(name: string | undefined, emailMasked: string): string {
  const source = (name ?? emailMasked ?? "").trim();
  return source.length > 0 ? source.charAt(0).toUpperCase() : "B";
}

export function LoginModal({
  visible,
  onClose,
}: LoginModalProps): React.ReactElement {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [code, setCode] = useState("");
  const auth = useAuth();
  const codeInputRef = useRef<TextInput>(null);

  // Reset the whole flow whenever the modal (re)opens -- a fresh email step.
  useEffect(() => {
    if (visible) {
      setStep("email");
      setEmail("");
      setEmailError("");
      setCode("");
      auth.reset();
    }
    // Intentionally only react to `visible` toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  // ----- Email step: send OTP -----------------------------------------------
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
      setCode("");
      setStep("code");
      setTimeout(() => codeInputRef.current?.focus(), 50);
    } catch {
      // requestError is surfaced in the email step via the hook state.
    }
  }, [auth, email]);

  // ----- Code step: verify OTP ----------------------------------------------
  const canVerify = /^\d{6}$/.test(code);

  const onVerify = useCallback(async () => {
    if (!canVerify) return;
    try {
      const session = await auth.verifyOtp({ email, code });
      if (session.isNew) {
        // NEW email -> registration (name + NIK). RBT-021 builds the real form;
        // here we only present the handoff affordance, no form fields.
        // TODO(RBT-021): render the name + NIK registration step here.
        setStep("register");
      } else {
        // Returning user -> straight to the signed-in panel.
        setStep("signed");
      }
    } catch {
      // verifyError is surfaced in the code step via the hook state.
    }
  }, [auth, canVerify, code, email]);

  const backToEmail = useCallback(() => {
    auth.reset();
    setCode("");
    setStep("email");
  }, [auth]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      // Escape on web / hardware back on native both close the dialog.
    >
      {/* Backdrop -- tapping outside the card closes (prototype lgBack click). */}
      <Pressable
        testID="login-backdrop"
        accessibilityLabel="Tutup dialog"
        onPress={close}
        style={{
          flex: 1,
          backgroundColor: "rgba(5,5,7,0.6)",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        {/* Card -- stopPropagation so taps inside don't close. */}
        <Pressable
          testID="login-card"
          accessibilityViewIsModal
          accessibilityRole={Platform.OS === "web" ? "none" : undefined}
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 400,
            backgroundColor: tokens.neutral.card,
            borderWidth: 1,
            borderColor: tokens.neutral.line,
            borderRadius: tokens.radius["3xl"],
            padding: 24,
          }}
        >
          {step === "email" && (
            <View>
              <Text accessibilityRole="header" style={styles.title}>
                Masuk / Daftar
              </Text>
              <Text style={styles.sub}>
                Masukkan email, kami kirim kode OTP. Email baru akan diminta
                melengkapi nama &amp; NIK.
              </Text>
              <View style={styles.fld}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  testID="login-email-input"
                  accessibilityLabel="Email"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="kamu@email.com"
                  placeholderTextColor={tokens.neutral.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  style={styles.input}
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

          {step === "code" && (
            <View>
              <Text accessibilityRole="header" style={styles.title}>
                Masukkan Kode
              </Text>
              <Text style={styles.sub}>
                Kami kirim 6 digit ke <Text style={styles.bold}>{email}</Text>.
              </Text>
              <View style={styles.fld}>
                <Text style={styles.label}>Kode OTP</Text>
                <TextInput
                  ref={codeInputRef}
                  testID="login-code-input"
                  accessibilityLabel="Kode OTP"
                  value={code}
                  onChangeText={(t) => setCode(normalizeCode(t))}
                  placeholder="••••••"
                  placeholderTextColor={tokens.neutral.muted}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={6}
                  style={styles.input}
                />
                <Text testID="login-code-error" style={styles.err}>
                  {auth.verifyError
                    ? messageFor(
                        auth.verifyError,
                        "Kode OTP salah atau kedaluwarsa. Coba lagi.",
                      )
                    : ""}
                </Text>
                <Text style={styles.hint}>
                  Kode demo: <Text style={styles.bold}>123456</Text>
                </Text>
              </View>
              <View style={styles.actions}>
                <GhostButton
                  testID="login-change-email"
                  label="Ganti email"
                  onPress={backToEmail}
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

          {step === "signed" && (
            <View>
              <Text accessibilityRole="header" style={styles.title}>
                Akun kamu
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
                  <Text testID="login-signed-email" style={styles.signedEmail}>
                    {auth.profile?.emailMasked ?? email}
                  </Text>
                </View>
              </View>
              <Text style={[styles.sub, { marginTop: 14 }]}>
                Data pembeli akan terisi otomatis saat checkout.
              </Text>
              <View style={styles.actions}>
                <GhostButton
                  testID="login-close"
                  label="Tutup"
                  onPress={close}
                />
                {/* Keluar is a visual stub -- real logout/persistence is RBT-023. */}
                <PrimaryButton
                  testID="login-logout"
                  label="Keluar"
                  variant="danger"
                  // TODO(RBT-023): clear the secure session + persist logout.
                  onPress={close}
                />
              </View>
            </View>
          )}

          {step === "register" && (
            <View>
              <Text accessibilityRole="header" style={styles.title}>
                Lengkapi Pendaftaran
              </Text>
              <Text style={styles.sub}>
                Email baru (<Text style={styles.bold}>{email}</Text>) sudah
                terverifikasi. Lanjut lengkapi nama &amp; NIK untuk menyelesaikan
                pendaftaran.
              </Text>
              {/* TODO(RBT-021): replace this handoff with the name + NIK
                  registration step (prototype #lgRegStep). The email above is
                  already OTP-verified. RBT-020 does NOT build the form. */}
              <View style={styles.actions}>
                <GhostButton
                  testID="login-reg-close"
                  label="Tutup"
                  onPress={close}
                />
                <PrimaryButton
                  testID="login-reg-continue"
                  label="Lanjut lengkapi pendaftaran"
                  // TODO(RBT-021): advance to the registration form instead of closing.
                  onPress={close}
                />
              </View>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Buttons (prototype .ghost / .go)
// ---------------------------------------------------------------------------

interface ButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly testID?: string;
}

function GhostButton({
  label,
  onPress,
  disabled,
  testID,
}: ButtonProps): React.ReactElement {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.ghost}
    >
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
  testID,
  variant,
}: ButtonProps & { variant?: "default" | "danger" }): React.ReactElement {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.go,
        variant === "danger" && { backgroundColor: tokens.brand.red },
        disabled && { opacity: 0.45 },
      ]}
    >
      <Text style={styles.goText}>{label}</Text>
      {variant !== "danger" && (
        <View style={styles.pin}>
          <Text style={styles.pinText}>›</Text>
        </View>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles -- mirror the prototype .lg / .lg-actions / .go / .ghost
// ---------------------------------------------------------------------------

const styles = {
  title: {
    fontSize: tokens.fontSize["2xl"],
    fontWeight: tokens.fontWeight.extrabold,
    letterSpacing: -0.4,
    color: tokens.neutral.ink,
  },
  sub: {
    fontSize: tokens.fontSize.sm,
    color: tokens.neutral.muted,
    marginTop: 6,
    lineHeight: 20,
  },
  bold: { fontWeight: tokens.fontWeight.bold, color: tokens.neutral.ink },
  fld: { marginTop: 16 },
  label: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.bold,
    marginBottom: 6,
    color: tokens.neutral.ink,
  },
  input: {
    width: "100%" as const,
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.semibold,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: tokens.radius.md,
    borderWidth: 1.5,
    borderColor: tokens.neutral.line,
    backgroundColor: tokens.neutral.paper,
    color: tokens.neutral.ink,
    letterSpacing: 0.6,
  },
  err: {
    color: tokens.brand.red,
    fontSize: 11,
    marginTop: 6,
    minHeight: 14,
    fontWeight: tokens.fontWeight.semibold,
  },
  hint: {
    fontSize: 11,
    color: tokens.neutral.muted,
    marginTop: 8,
  },
  actions: { flexDirection: "row" as const, gap: 10, marginTop: 20 },
  ghost: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: "rgba(10,10,12,0.05)",
    borderWidth: 1,
    borderColor: tokens.neutral.line,
    borderRadius: tokens.radius.pill,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  ghostText: {
    color: tokens.neutral.ink,
    fontWeight: tokens.fontWeight.semibold,
    fontSize: tokens.fontSize.base,
  },
  go: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 9,
    backgroundColor: tokens.neutral.ink,
    borderRadius: tokens.radius.pill,
    paddingVertical: 13,
  },
  goText: {
    color: "#fff",
    fontWeight: tokens.fontWeight.bold,
    fontSize: tokens.fontSize.base,
  },
  pin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.brand.red,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  pinText: { color: "#fff", fontSize: 12, fontWeight: tokens.fontWeight.bold },
  signedin: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.brand.ember,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatarText: {
    color: "#fff",
    fontWeight: tokens.fontWeight.extrabold,
    fontSize: tokens.fontSize.xl,
  },
  signedName: {
    fontWeight: tokens.fontWeight.extrabold,
    fontSize: tokens.fontSize.md,
    color: tokens.neutral.ink,
  },
  signedEmail: { fontSize: tokens.fontSize.xs, color: tokens.neutral.muted },
};
