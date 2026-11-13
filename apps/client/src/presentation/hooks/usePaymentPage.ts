/**
 * usePaymentPage — presentation seam for the payment page (RBT-060).
 *
 * Wraps the framework-free {@link GetPaymentPage} use case (→ frozen
 * {@link PaymentRepository} via `useServices()`). TanStack Query lives HERE
 * (D3). Returns the server summary + method list + deadline the Payment screen
 * renders; the countdown is driven from `paymentExpiresAt`/`serverTime` through
 * the ServerClock, never the device clock.
 */
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { GetPaymentPage } from "@application/payment/get-payment-page.use-case";
import type { PaymentPage } from "@domain/repositories/payment.repository";
import { useServices } from "@providers/service-context";

export function usePaymentPage(bookingId: string): {
  page: PaymentPage | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
  isFetching: boolean;
} {
  const { paymentRepository, paymentJourneyStorage } = useServices();
  const usecase = useMemo(
    () => new GetPaymentPage(paymentRepository),
    [paymentRepository],
  );
  const query = useQuery<PaymentPage, Error>({
    queryKey: ["payment-page", bookingId],
    queryFn: () => usecase.execute(bookingId),
    enabled: bookingId.length > 0,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
  useEffect(() => {
    if (!bookingId) return;
    void paymentJourneyStorage.save(bookingId).catch(() => undefined);
  }, [bookingId, paymentJourneyStorage]);
  return {
    page: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
