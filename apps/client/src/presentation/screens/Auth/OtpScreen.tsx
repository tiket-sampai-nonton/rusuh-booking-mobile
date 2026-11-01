/**
 * OtpScreen — OPTIONAL passwordless sign-in entry point (RBT-020, E3).
 *
 * Two steps: (1) email entry → request OTP, (2) 6-digit code entry → verify →
 * {@link AuthSession}. Works on native + RN Web. Forms use React Hook Form +
 * Zod; the backend is reached only through `useAuth()` → the auth use cases →
 * the UserRepository port.
 *
 * Sign-in is NON-BLOCKING (D8.5): a "Lewати" (skip) affordance lets a guest
 * leave at any time ("Lewati"), and nothing here gates browse/queue/checkout. When a
 * returning user verifies (isNew=false) they are signed straight in.
 *
 * Styling: NativeWind `className`. Every surface sets a background + text pair
 * (tokens mirrored in tailwind.config.js via presentation/theme).
 *
 * SECURITY: the raw OTP code and issued token are never logged.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import type { AuthSession } from "@domain/repositories/user.repository";
import { useAuth } from "@presentation/hooks/useAuth";
import {
  codeSchema,
  emailSchema,
  type CodeForm,
  type EmailForm,
} from "@presentation/screens/Auth/auth.schema";

export interface OtpScreenProps {
  /**
   * Called after a successful verify (sign-in complete). OPTIONAL so the screen
   * stays decoupled from routing.
   */
  readonly onAuthenticated?: (session: AuthSession) => void;
  /** Called when the guest skips sign-in. Keeps the flow non-blocking (D8.5). */
  readonly onSkip?: () => void;
}

/** Shared error text helper. */
function FieldError({ message }: { message?: string }): React.ReactElement | null {
  if (!message) return null;
  return (
    <Text className="mt-1 text-xs text-error" accessibilityRole="alert">
      {message}
    </Text>
  );
}

export function OtpScreen({
  onAuthenticated,
  onSkip,
}: OtpScreenProps): React.ReactElement {
  const auth = useAuth();
  const [email, setEmail] = useState("");

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const codeForm = useForm<CodeForm>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const onSubmitEmail = emailForm.handleSubmit(async (values) => {
    try {
      await auth.requestOtp(values.email);
      setEmail(values.email);
    } catch {
      // The typed error is surfaced via `auth.requestError`; swallow the
      // rejection so it does not bubble as an unhandled promise.
    }
  });

  const onSubmitCode = codeForm.handleSubmit(async (values) => {
    try {
      const session = await auth.verifyOtp({ email, code: values.code });
      onAuthenticated?.(session);
    } catch {
      // The typed error is surfaced via `auth.verifyError`.
    }
  });

  const onResend = async (): Promise<void> => {
    try {
      await auth.requestOtp(email);
    } catch {
      // Surfaced via `auth.requestError`.
    }
  };

  return (
    <View className="flex-1 bg-background px-6 py-10">
      <Text
        className="text-2xl font-bold text-foreground"
        accessibilityRole="header"
      >
        Masuk
      </Text>
      <Text className="mt-2 text-sm text-muted-foreground">
        Masuk itu opsional — kamu tetap bisa menjelajah dan memesan tanpa akun.
      </Text>

      {!auth.otpSent ? (
        <View className="mt-8">
          <Text className="mb-2 text-sm font-semibold text-foreground">
            Email
          </Text>
          <Controller
            control={emailForm.control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-xl border border-line bg-card px-4 py-3 text-base text-foreground"
                placeholder="nama@email.com"
                placeholderTextColor="#6b6b76"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                inputMode="email"
                accessibilityLabel="Email"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
          <FieldError message={emailForm.formState.errors.email?.message} />

          {auth.requestError ? (
            <Text className="mt-2 text-xs text-error" accessibilityRole="alert">
              Gagal mengirim kode. Coba lagi.
            </Text>
          ) : null}

          <Pressable
            className="mt-6 items-center rounded-xl bg-brand px-4 py-3"
            accessibilityRole="button"
            accessibilityLabel="Kirim kode"
            disabled={auth.isRequesting}
            onPress={onSubmitEmail}
          >
            {auth.isRequesting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-semibold text-white">
                Kirim kode
              </Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View className="mt-8">
          <Text className="mb-2 text-sm font-semibold text-foreground">
            Kode OTP
          </Text>
          <Text className="mb-3 text-xs text-muted-foreground">
            Kami mengirim kode 6 digit ke emailmu.
          </Text>
          <Controller
            control={codeForm.control}
            name="code"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-xl border border-line bg-card px-4 py-3 text-base tracking-widest text-foreground"
                placeholder="______"
                placeholderTextColor="#6b6b76"
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={6}
                accessibilityLabel="Kode OTP"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
          <FieldError message={codeForm.formState.errors.code?.message} />

          {auth.verifyError ? (
            <Text className="mt-2 text-xs text-error" accessibilityRole="alert">
              Kode OTP salah atau kedaluwarsa. Coba lagi.
            </Text>
          ) : null}

          <Pressable
            className="mt-6 items-center rounded-xl bg-brand px-4 py-3"
            accessibilityRole="button"
            accessibilityLabel="Verifikasi"
            disabled={auth.isVerifying}
            onPress={onSubmitCode}
          >
            {auth.isVerifying ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-semibold text-white">
                Verifikasi
              </Text>
            )}
          </Pressable>

          <Pressable
            className="mt-4 items-center bg-background px-4 py-2"
            accessibilityRole="button"
            accessibilityLabel="Kirim ulang kode"
            disabled={auth.isRequesting}
            onPress={onResend}
          >
            <Text className="text-sm font-semibold text-brand">
              Kirim ulang kode
            </Text>
          </Pressable>
        </View>
      )}

      {onSkip ? (
        <Pressable
          className="mt-8 items-center bg-background px-4 py-2"
          accessibilityRole="button"
          accessibilityLabel="Lewati masuk"
          onPress={onSkip}
        >
          <Text className="text-sm text-muted-foreground">
            Lewati, lanjut tanpa masuk
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
