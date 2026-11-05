import { useEffect } from "react";

import { useAccountStore } from "@presentation/stores/account-store";
import { useServices } from "@providers/service-context";

/** Restores an existing session without making sign-in mandatory for guests. */
export function AccountSessionBridge() {
  const { tokenStorage, userRepository } = useServices();
  useEffect(() => {
    let active = true;
    void tokenStorage.load().then(async (token) => {
      if (!active || !token || useAccountStore.getState().profile) return;
      try {
        const profile = await userRepository.getMe();
        if (active) useAccountStore.getState().setProfile(profile);
      } catch {
        // Expired or unavailable sessions remain guests; booking stays public.
      }
    });
    return () => {
      active = false;
    };
  }, [tokenStorage, userRepository]);
  return null;
}
