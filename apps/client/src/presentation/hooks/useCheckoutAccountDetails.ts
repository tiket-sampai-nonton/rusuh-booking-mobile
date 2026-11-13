/**
 * Loads checkout account details through the application use case.
 * Raw NIK stays only in this mounted hook's memory; it is never cached or persisted.
 */
import { useEffect, useMemo, useState } from "react";

import { GetCheckoutUserDetails } from "@application/auth/get-checkout-user-details.use-case";
import type { CheckoutUserDetails } from "@domain/repositories/user.repository";
import { useServices } from "@providers/service-context";

export interface CheckoutAccountDetailsState {
  readonly details: CheckoutUserDetails | null;
  readonly hasAuthToken: boolean;
}

export function useCheckoutAccountDetails(): CheckoutAccountDetailsState {
  const { tokenStorage, userRepository } = useServices();
  const getDetails = useMemo(
    () => new GetCheckoutUserDetails(userRepository),
    [userRepository],
  );
  const [details, setDetails] = useState<CheckoutUserDetails | null>(null);
  const [hasAuthToken, setHasAuthToken] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const token = await tokenStorage.load();
        if (!token || !active) return;
        setHasAuthToken(true);
        const checkoutDetails = await getDetails.execute();
        if (active) setDetails(checkoutDetails);
      } catch {
        // Manual checkout remains available if account lookup is unavailable.
      }
    })();
    return () => {
      active = false;
    };
  }, [getDetails, tokenStorage]);

  return { details, hasAuthToken };
}
