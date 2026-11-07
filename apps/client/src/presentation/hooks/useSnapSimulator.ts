/**
 * useSnapSimulator — drives the mock SNAP callback (RBT-065, D10.5).
 *
 * The local SNAP simulator stands in for the Midtrans hosted page. Pressing a
 * simulate button calls the PaymentRepository `snapCallback` (the port method
 * the real gateway webhook also implements — Liskov-substitutable, AC1), which
 * sets the authoritative status. The screen then routes to the RESULT GATE,
 * which re-verifies via getStatus — the callback is never trusted alone (D10.2).
 *
 * TanStack Query is confined to this hook (D3 seam); the backend is reached only
 * through the frozen port read from the DI container via useServices().
 */
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import type {
  PaymentAttempt,
  SnapOutcome,
} from "@domain/repositories/payment.repository";
import { useServices } from "@providers/service-context";

export function useSnapSimulator(): {
  readonly settle: UseMutationResult<PaymentAttempt, Error, SnapCallbackInput>;
} {
  const { paymentRepository } = useServices();
  const settle = useMutation<PaymentAttempt, Error, SnapCallbackInput>({
    mutationFn: ({ attemptId, outcome }) =>
      paymentRepository.snapCallback(attemptId, outcome),
  });
  return { settle };
}

export interface SnapCallbackInput {
  readonly attemptId: string;
  readonly outcome: SnapOutcome;
}
