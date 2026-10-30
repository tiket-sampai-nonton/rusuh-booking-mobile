/**
 * usePayment — payment-attempt seam (RBT-060/061). createAttempt is the
 * mutation the "Bayar" button fires; it records the attempt so the SNAP
 * simulator + verify step can reference it. TanStack confined here (D3).
 */
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { CreatePaymentAttempt } from "@application/use-cases/create-payment-attempt";
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

export function usePayment(): {
  readonly createAttempt: UseMutationResult<PaymentAttempt, Error, CreateAttemptInput>;
} {
  const { paymentRepository, idempotencyKeys } = useServices();
  const setPaymentMethod = useSessionStore((s) => s.setPaymentMethod);

  const createAttempt = useMutation<PaymentAttempt, Error, CreateAttemptInput>({
    mutationFn: ({ bookingId, method }) =>
      new CreatePaymentAttempt(paymentRepository, idempotencyKeys).execute(
        bookingId,
        method,
      ),
    onSuccess: (attempt, { method }) => {
      setPaymentMethod(method, attempt.attemptId);
    },
  });

  return { createAttempt };
}
