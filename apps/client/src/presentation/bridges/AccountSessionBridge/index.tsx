import { useEffect } from "react";

import { useAccountStore } from "@presentation/stores/account-store";
import { useServices } from "@providers/service-context";

/** Restores an existing session without making sign-in mandatory for guests. */
export function AccountSessionBridge() {
  const { tokenStorage, buyerEmailStorage, userRepository } = useServices();
  useEffect(() => {
    let active = true;
    void Promise.all([
      tokenStorage.load(),
      buyerEmailStorage.load().catch(() => null),
    ])
      .then(async ([token, buyerEmail]) => {
        if (!active || !token || useAccountStore.getState().profile) return;
        try {
          const profile = await userRepository.getMe();
          if (active) {
            useAccountStore
              .getState()
              .setProfile(profile, buyerEmail ?? undefined);
          }
        } catch {
          // Expired or unavailable sessions remain guests; booking stays public.
        }
      })
      .catch(() => {
        // Storage errors should not prevent guest access to public screens.
      });
    return () => {
      active = false;
    };
  }, [buyerEmailStorage, tokenStorage, userRepository]);
  return null;
}
