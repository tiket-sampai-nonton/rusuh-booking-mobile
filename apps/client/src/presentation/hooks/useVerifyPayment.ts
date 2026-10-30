/**
 * useVerifyPayment — authoritative status verification (RBT-063/070).
 *
 * Reads the payment status via getStatus (the BE is authoritative — never trust
 * the SNAP callback alone, D10.2). The success screen renders PAID only when
 * this reports PAID. TanStack confined here (D3).
 */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { VerifyPayment } from "@application/use-cases/create-payment-attempt";
import type { PaymentAttempt } from "@domain/repositories/payment.repository";
import { useServices } from "@providers/service-context";

export function useVerifyPayment(
  attemptId: string | undefined,
): UseQueryResult<PaymentAttempt, Error> {
  const { paymentRepository } = useServices();
  return useQuery<PaymentAttempt, Error>({
    queryKey: ["payment", "status", attemptId],
    queryFn: () => new VerifyPayment(paymentRepository).execute(attemptId as string),
    enabled: !!attemptId,
  });
}
