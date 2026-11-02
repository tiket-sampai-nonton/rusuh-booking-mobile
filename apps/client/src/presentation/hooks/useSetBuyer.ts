/**
 * useSetBuyer — presentation seam for persisting the session buyer (RBT-053).
 *
 * Wraps the framework-free {@link SetBuyer} use case (→ frozen
 * {@link BookingRepository} port via `useServices()`). TanStack's mutation lives
 * HERE, never in the use case/domain (D3). Called before the hold so a refresh
 * keeps the buyer (FE-NEED O1, mock until BE delivers). Raw NIK goes to the BE
 * over TLS but is never stored/logged on the FE.
 */
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

import { SetBuyer } from "@application/booking/set-buyer.use-case";
import { useServices } from "@providers/service-context";

export interface SetBuyerInput {
  readonly sessionId: string;
  readonly buyerNik: string;
  readonly email: string;
}

export function useSetBuyer(): {
  setBuyer: (input: SetBuyerInput) => Promise<void>;
  isSaving: boolean;
  error: Error | null;
} {
  const { bookingRepository } = useServices();
  const usecase = useMemo(
    () => new SetBuyer(bookingRepository),
    [bookingRepository],
  );
  const mutation = useMutation<void, Error, SetBuyerInput>({
    mutationFn: ({ sessionId, buyerNik, email }) =>
      usecase.execute(sessionId, buyerNik, email),
  });
  return {
    setBuyer: mutation.mutateAsync,
    isSaving: mutation.isPending,
    error: mutation.error,
  };
}
