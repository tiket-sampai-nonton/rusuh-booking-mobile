/**
 * LoginModal — 1:1 of the prototype index.html "Masuk / Daftar" (OTP) modal.
 *
 * Login is OPTIONAL (guest flow is primary) — this modal is opened by the nav
 * "Masuk / Daftar" button and walks the prototype's steps:
 *   email  → enter email, "Kirim OTP"
 *   code   → 6-digit OTP (demo 123456), "Verifikasi"
 *   register → NEW email only: Nama + NIK, "Daftar & Masuk"  (existing → signed)
 *   signed  → account card + "Keluar" (logout)
 *   done    → "Pendaftaran Berhasil 🎉" + "Mulai Pesan Tiket"
 *
 * On success it stores the buyer identity in the account store so checkout can
 * auto-fill. A known demo email ("ada@rusuh.id") is treated as an EXISTING
 * account (skips register); any other email is treated as NEW. Matches the
 * prototype's branch (existing → signed step, new → register step).
 */
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { isValidEmail, isValidNik } from "@domain/rules/checkout";
import { useAccountStore } from "@presentation/stores/account-store";

const DEMO_OTP = "123456";
const KNOWN_EMAIL = "ada@rusuh.id"; // demo existing account (skips register)

type Step = "email" | "code" | "register" | "signed" | "done";

export interface LoginModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

export function LoginModal({ visible, onClose }: LoginModalProps) {
  const account = useAccountStore((s) => s.account);
  const signIn = useAccountStore((s) => s.signIn);
  const signOut = useAccountStore((s) => s.signOut);

  const [step, setStep] = useState<Step>(account ? "signed" : "email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [nik, setNik] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const resetAndClose = (): void => {
    setStep(useAccountStore.getState().account ? "signed" : "email");
    setEmail("");
    setCode("");
    setName("");
    setNik("");
    setErr(null);
    onClose();
  };

  const sendOtp = (): void => {
    if (!isValidEmail(email)) {
      setErr("Masukkan email yang valid.");
      return;
    }
    setErr(null);
    setStep("code");
  };

  const verify = (): void => {
    if (code !== DEMO_OTP) {
      setErr("Kode OTP salah. Coba 123456 (demo).");
      return;
    }
    setErr(null);
    // Existing demo account → straight to signed; new email → register.
    if (email.toLowerCase() === KNOWN_EMAIL) {
      signIn({ email, name: "Ada Lovelace", nik: "3200000000000001" });
      setStep("signed");
    } else {
      setStep("register");
    }
  };

  const register = (): void => {
    if (name.trim().length < 2) {
      setErr("Isi nama sesuai KTP.");
      return;
    }
    if (!isValidNik(nik)) {
      setErr("NIK harus 16 digit.");
      return;
    }
    setErr(null);
    signIn({ email, name: name.trim(), nik });
    setStep("done");
  };

  const logout = (): void => {
    signOut();
    setStep("email");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetAndClose}>
      <Pressable
        accessibilityLabel="Tutup login"
        onPress={resetAndClose}
        className="flex-1 items-center justify-center bg-ink/70 p-5"
        testID="login-backdrop"
      >
        {/* Inner card — stop propagation so taps inside don't close. */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl border border-line bg-card p-6"
          testID="login-modal"
        >
          {step === "email" ? (
            <View testID="login-step-email">
              <Text className="text-xl font-extrabold text-foreground" accessibilityRole="header">
                Masuk / Daftar
              </Text>
              <Text className="mt-1.5 text-sm text-muted-foreground">
                Masukkan email, kami kirim kode OTP. Email baru akan diminta
                melengkapi nama &amp; NIK.
              </Text>
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="kamu@email.com"
                keyboardType="email-address"
                testID="login-email"
              />
              {err ? <ErrText>{err}</ErrText> : null}
              <Actions
                onCancel={resetAndClose}
                primaryLabel="Kirim OTP"
                onPrimary={sendOtp}
                primaryTestID="login-send"
              />
            </View>
          ) : null}

          {step === "code" ? (
            <View testID="login-step-code">
              <Text className="text-xl font-extrabold text-foreground" accessibilityRole="header">
                Masukkan Kode
              </Text>
              <Text className="mt-1.5 text-sm text-muted-foreground">
                Kami kirim 6 digit ke {email}.
              </Text>
              <Field
                label="Kode OTP"
                value={code}
                onChangeText={setCode}
                placeholder="••••••"
                keyboardType="number-pad"
                maxLength={6}
                testID="login-code"
              />
              <Text className="mt-1 text-2xs text-muted-foreground">Kode demo: 123456</Text>
              {err ? <ErrText>{err}</ErrText> : null}
              <Actions
                cancelLabel="Ganti email"
                onCancel={() => setStep("email")}
                primaryLabel="Verifikasi"
                onPrimary={verify}
                primaryTestID="login-verify"
              />
            </View>
          ) : null}

          {step === "register" ? (
            <View testID="login-step-register">
              <Text className="text-xl font-extrabold text-foreground" accessibilityRole="header">
                Lengkapi Pendaftaran
              </Text>
              <Text className="mt-1.5 text-sm text-muted-foreground">
                Email baru — isi data diri sekali saja. Dipakai untuk mengisi
                checkout otomatis.
              </Text>
              <Field
                label="Nama Lengkap"
                value={name}
                onChangeText={setName}
                placeholder="Nama sesuai KTP"
                testID="login-name"
              />
              <Field
                label="NIK (16 digit)"
                value={nik}
                onChangeText={setNik}
                placeholder="16 digit KTP"
                keyboardType="number-pad"
                maxLength={16}
                testID="login-nik"
              />
              {err ? <ErrText>{err}</ErrText> : null}
              <Actions
                onCancel={resetAndClose}
                primaryLabel="Daftar &amp; Masuk"
                onPrimary={register}
                primaryTestID="login-register"
              />
            </View>
          ) : null}

          {step === "signed" ? (
            <View testID="login-step-signed">
              <Text className="text-xl font-extrabold text-foreground" accessibilityRole="header">
                Akun kamu
              </Text>
              <Text className="mt-3 text-base font-bold text-foreground">{account?.name ?? "—"}</Text>
              <Text className="text-sm text-muted-foreground">{account?.email ?? "—"}</Text>
              <Text className="mt-3.5 text-sm text-muted-foreground">
                Data pembeli akan terisi otomatis saat checkout.
              </Text>
              <Actions
                cancelLabel="Tutup"
                onCancel={resetAndClose}
                primaryLabel="Keluar"
                onPrimary={logout}
                primaryTestID="login-logout"
                destructive
              />
            </View>
          ) : null}

          {step === "done" ? (
            <View testID="login-step-done" className="items-center">
              <Text className="text-2xl" accessibilityElementsHidden>✅</Text>
              <Text className="mt-2 text-xl font-extrabold text-foreground" accessibilityRole="header">
                Pendaftaran Berhasil 🎉
              </Text>
              <Text className="mt-1.5 text-center text-sm text-muted-foreground">
                Akun {name} aktif. Data pembeli (nama, NIK, email) akan terisi
                otomatis saat checkout.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mulai Pesan Tiket"
                onPress={resetAndClose}
                testID="login-done-close"
                className="mt-5 w-full items-center rounded-pill bg-brand py-3.5"
              >
                <Text className="text-sm font-bold text-white">Mulai Pesan Tiket ↗</Text>
              </Pressable>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Field({
  label,
  testID,
  ...props
}: {
  readonly label: string;
  readonly testID: string;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View className="mt-4">
      <Text className="mb-1.5 text-xs font-semibold text-muted-foreground">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#9aa0a6"
        className="rounded-xl border border-line bg-background px-3.5 py-3 text-sm text-foreground"
        testID={testID}
        {...props}
      />
    </View>
  );
}

function ErrText({ children }: { readonly children: string }) {
  return (
    <Text className="mt-2 text-xs text-error" accessibilityLiveRegion="polite" testID="login-error">
      {children}
    </Text>
  );
}

function Actions({
  cancelLabel = "Batal",
  onCancel,
  primaryLabel,
  onPrimary,
  primaryTestID,
  destructive = false,
}: {
  readonly cancelLabel?: string;
  readonly onCancel: () => void;
  readonly primaryLabel: string;
  readonly onPrimary: () => void;
  readonly primaryTestID: string;
  readonly destructive?: boolean;
}) {
  return (
    <View className="mt-5 flex-row justify-end gap-2.5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
        onPress={onCancel}
        className="rounded-pill border border-line px-5 py-3"
      >
        <Text className="text-sm font-semibold text-foreground">{cancelLabel}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
        onPress={onPrimary}
        testID={primaryTestID}
        className={`rounded-pill px-5 py-3 ${destructive ? "bg-error" : "bg-brand"}`}
      >
        <Text className="text-sm font-bold text-white">{primaryLabel}</Text>
      </Pressable>
    </View>
  );
}
