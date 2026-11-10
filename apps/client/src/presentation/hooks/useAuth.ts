/**
 * useAuth — presentation hook for the OTP sign-in flow (RBT-020, E3).
 *
 * The swap seam: TanStack Query lives HERE (presentation/hooks), never in the
 * use cases or the domain. The hook reaches the backend only through the auth
 * use cases → the {@link UserRepository} port, obtained from the DI container
 * via `useServices()` — it never names a concrete adapter or imports
 * infrastructure (ARCHITECTURE §3, §4.3).
 *
 * Sign-in is OPTIONAL (D8.5): this hook powers the landing login modal; it does
 * NOT gate browse/queue/checkout. A guest can ignore it entirely.
 *
 * SECURITY: the raw OTP code and the issued token are passed straight to the
 * use case and never logged here. Only a MASKED profile is surfaced to the UI.
 */
import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { CompleteRegistration } from "@application/auth/complete-registration.use-case";
import { PersistSession } from "@application/auth/persist-session.use-case";
import { RequestOtp } from "@application/auth/request-otp.use-case";
import { VerifyOtp } from "@application/auth/verify-otp.use-case";
import type {
  AuthSession,
  UserProfile,
} from "@domain/repositories/user.repository";
import { useServices } from "@providers/service-context";
import { useAccountStore } from "@presentation/stores/account-store";

export interface UseAuthResult {
  /** Trigger an OTP send. Resolves when the request is accepted. */
  readonly requestOtp: (email: string) => Promise<void>;
  /** True while the OTP request is in flight. */
  readonly isRequesting: boolean;
  /** The request error (typed DomainError when the port rejects), if any. */
  readonly requestError: Error | null;
  /** True once an OTP request has succeeded (enables the code step). */
  readonly otpSent: boolean;

  /** Verify an OTP; resolves with the issued {@link AuthSession}. */
  readonly verifyOtp: (input: {
    email: string;
    code: string;
  }) => Promise<AuthSession>;
  /** True while the verify is in flight. */
  readonly isVerifying: boolean;
  /** The verify error (typed DomainError on a wrong/expired code), if any. */
  readonly verifyError: Error | null;
  /** The session issued by the last successful verify, if any. */
  readonly session: AuthSession | null;

  /** The signed-in profile (masked), populated after a returning-user verify. */
  readonly profile: UserProfile | null;

  /**
   * Complete registration for a NEW account (RBT-021). Validates NIK + name in
   * the use case, then resolves with the masked {@link UserProfile}. The raw
   * NIK is never logged here.
   */
  readonly completeRegistration: (input: {
    fullName: string;
    nik: string;
  }) => Promise<UserProfile>;
  /** True while the registration submit is in flight. */
  readonly isRegistering: boolean;
  /** The registration error (typed DomainError, e.g. NIK_INVALID), if any. */
  readonly registerError: Error | null;

  /** Reset all auth state (used by "Ganti email" and when the modal closes). */
  readonly reset: () => void;
}

/**
 * Bind the auth use cases to TanStack Query mutations against the container's
 * `userRepository`. The use cases are memoized per repository instance.
 */
export function useAuth(): UseAuthResult {
  const { userRepository, tokenStorage } = useServices();
  const setAccountProfile = useAccountStore((s) => s.setProfile);
  const setBuyerEmail = useAccountStore((s) => s.setBuyerEmail);
  const clearAccountProfile = useAccountStore((s) => s.clearProfile);

  const { requestOtp, verifyOtp, completeRegistration, persistSession } =
    useMemo(
      () => ({
        requestOtp: new RequestOtp(userRepository),
        verifyOtp: new VerifyOtp(userRepository),
        completeRegistration: new CompleteRegistration(userRepository),
        persistSession: new PersistSession(tokenStorage),
      }),
      [userRepository, tokenStorage],
    );

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const requestMutation = useMutation<void, Error, string>({
    mutationFn: (email: string) => requestOtp.execute(email),
  });

  const verifyMutation = useMutation<
    AuthSession,
    Error,
    { email: string; code: string }
  >({
    mutationFn: ({ email, code }) => verifyOtp.execute(email, code),
    onSuccess: async (result, variables) => {
      await persistSession.execute(result.token);
      // The OTP address is the only unmasked email available to the client.
      // Keep it in the in-memory account store for this session's checkout.
      setBuyerEmail(variables.email);
      // Returning user → fetch the masked profile for the signed-in panel.
      // New user → RBT-021 completes registration before a profile exists.
      if (result.isNew) {
        setProfile(null);
        return;
      }
      try {
        const currentProfile = await userRepository.getMe();
        setProfile(currentProfile);
        setAccountProfile(currentProfile, variables.email);
      } catch {
        // Profile fetch is best-effort for the visual panel; a failure here
        // does not break the (optional) sign-in. The raw token is never logged.
        setProfile(null);
      }
    },
  });

  const registerMutation = useMutation<
    UserProfile,
    Error,
    { fullName: string; nik: string }
  >({
    mutationFn: (input) => completeRegistration.execute(input),
    onSuccess: (result) => {
      // Registration complete → the masked profile powers the signed-in panel
      // and checkout auto-fill. The raw NIK is never stored/logged here.
      setProfile(result);
      setAccountProfile(result);
    },
  });

  const reset = useCallback(() => {
    requestMutation.reset();
    verifyMutation.reset();
    registerMutation.reset();
    setProfile(null);
    clearAccountProfile();
  }, [requestMutation, verifyMutation, registerMutation, clearAccountProfile]);

  return {
    requestOtp: (email: string) => requestMutation.mutateAsync(email),
    isRequesting: requestMutation.isPending,
    requestError: requestMutation.error,
    otpSent: requestMutation.isSuccess,

    verifyOtp: (input) => verifyMutation.mutateAsync(input),
    isVerifying: verifyMutation.isPending,
    verifyError: verifyMutation.error,
    session: verifyMutation.data ?? null,

    profile,

    completeRegistration: (input) => registerMutation.mutateAsync(input),
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    reset,
  };
}
