/**
 * usePayment — payment-attempt + SNAP-handoff seam (RBT-061).
 *
 * `createAttempt` is the mutation the "Bayar" button fires: it mints an
 * idempotency key (reused on retry, FR-25), creates the attempt via the frozen
 * PaymentRepository, records the selected method + attemptId in the session
 * store, then HANDS OFF to SNAP using the attempt's `redirectUrl`:
 *   • web   → navigate the browser to the SNAP page (redirectUrl)
 *   • native→ open the SNAP page in the in-app browser / WebView (Linking)
 * The FE never marks PAID from here — the callback is verified server-side
 * (RBT-063). TanStack is confined to this hook (D3); the platform open is
 * injected so it is deterministic in tests.
 */
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useMemo } from "react";
import { Linking, Platform } from "react-native";

import { CreatePaymentAttempt } from "@application/payment/create-payment-attempt.use-case";
import type {
  PaymentAttempt,
  PaymentMethod,
} from "@domain/repositories/payment.repository";
import { useServices } from "@providers/service-context";
import { useSessionStore } from "@presentation/stores/session-store";

export interface CreateAttemptInput {
  readonly bookingId: string;
  readonly method: PaymentMethod;
}

/**
 * Platform-aware SNAP handoff. Default: web assigns `window.location`, native
 * opens the URL via `Linking`. Overridable for tests. Returns a promise so a
 * caller can await the open.
 */
export async function openSnapHandoff(url: string, bookingId?: string): Promise<void> {
  // An in-app relative path (the mock SNAP simulator route `/snap/...`, RBT-065)
  // is navigated with the router, NOT window.location / Linking. The real BE
  // returns an absolute SNAP URL, which takes the external-open path below.
  // expo-router is required LAZILY (only when a relative path is handed off) so
  // importing this module in a test does not eagerly load the router internals.
  if (url.startsWith("/")) {
    const { router } =
      require("expo-router") as typeof import("expo-router");
    router.push(url as import("expo-router").Href);
    return;
  }
  if (Platform.OS === "web") {
    // Full-page redirect to the external SNAP gateway (D10.2).
    if (typeof globalThis !== "undefined" && "location" in globalThis) {
      (globalThis as { location: { assign: (u: string) => void } }).location.assign(url);
    }
    return;
  }
  // Native: open the external SNAP page in the in-app browser / WebView.
  if (bookingId) {
    const { router } = require("expo-router") as typeof import("expo-router");
    router.push(`/payment-webview/${encodeURIComponent(bookingId)}` as import("expo-router").Href);
    return;
  }
  await Linking.openURL(url);
}

export function usePayment(
  handoff: (url: string, bookingId?: string) => Promise<void> = openSnapHandoff,
): {
  readonly createAttempt: UseMutationResult<
    PaymentAttempt,
    Error,
    CreateAttemptInput
  >;
  readonly resumeHandoff: (attempt: PaymentAttempt) => Promise<void>;
} {
  const { paymentRepository, idempotencyKeys } = useServices();
  const setPaymentMethod = useSessionStore((s) => s.setPaymentMethod);
  const usecase = useMemo(
    () => new CreatePaymentAttempt(paymentRepository, idempotencyKeys),
    [paymentRepository, idempotencyKeys],
  );

  const createAttempt = useMutation<PaymentAttempt, Error, CreateAttemptInput>({
    mutationFn: ({ bookingId, method }) => usecase.execute(bookingId, method),
    onSuccess: async (attempt, { method }) => {
      setPaymentMethod(method, attempt.attemptId);
      if (attempt.redirectUrl) await handoff(attempt.redirectUrl, attempt.bookingId);
    },
  });

  // "Kembali ke SNAP" — re-open the handoff for an in-flight attempt (AC2).
  const resumeHandoff = async (attempt: PaymentAttempt): Promise<void> => {
    if (attempt.redirectUrl) await handoff(attempt.redirectUrl, attempt.bookingId);
  };

  return { createAttempt, resumeHandoff };
}
