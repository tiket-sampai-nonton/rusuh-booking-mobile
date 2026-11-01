/**
 * useAuth — presentation hook for the OTP sign-in flow (RBT-020, E3).
 *
 * The swap seam: TanStack Query lives HERE (presentation/hooks), never in the
 * use cases or the domain. The hook reaches the backend only through the auth
 * use cases → the {@link UserRepository} port, obtained from the DI container
 * via `useServices()` — it never names a concrete adapter or imports
 * infrastructure (ARCHITECTURE §3, §4.3).
 *
 * Sign-in is OPTIONAL (D8.5): this hook powers an entry-point screen; it does
 * NOT gate browse/queue/checkout. A guest can ignore it entirely.
 *
 * SECURITY: the raw OTP code and the issued token are passed straight to the
 * use case and returned to the caller — they are never logged here.
 */
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

import { RequestOtp } from "@application/auth/request-otp.use-case";
import { VerifyOtp } from "@application/auth/verify-otp.use-case";
import type { AuthSession } from "@domain/repositories/user.repository";
import { useServices } from "@providers/service-context";

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
}

/**
 * Bind the auth use cases to TanStack Query mutations against the container's
 * `userRepository`. The use cases are memoized per repository instance.
 */
export function useAuth(): UseAuthResult {
  const { userRepository } = useServices();

  const { requestOtp, verifyOtp } = useMemo(
    () => ({
      requestOtp: new RequestOtp(userRepository),
      verifyOtp: new VerifyOtp(userRepository),
    }),
    [userRepository],
  );

  const requestMutation = useMutation<void, Error, string>({
    mutationFn: (email: string) => requestOtp.execute(email),
  });

  const verifyMutation = useMutation<
    AuthSession,
    Error,
    { email: string; code: string }
  >({
    mutationFn: ({ email, code }) => verifyOtp.execute(email, code),
  });

  return {
    requestOtp: (email: string) => requestMutation.mutateAsync(email),
    isRequesting: requestMutation.isPending,
    requestError: requestMutation.error,
    otpSent: requestMutation.isSuccess,

    verifyOtp: (input) => verifyMutation.mutateAsync(input),
    isVerifying: verifyMutation.isPending,
    verifyError: verifyMutation.error,
    session: verifyMutation.data ?? null,
  };
}
