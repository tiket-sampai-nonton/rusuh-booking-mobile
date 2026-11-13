import { useEffect, useRef, useState } from "react";

import { useServices } from "@providers/service-context";

export interface ConnectivityView {
  readonly isOnline: boolean | null;
  readonly isOffline: boolean;
  readonly justReconnected: boolean;
}

/** Presentation state for OS connectivity events; network access stays in the adapter. */
export function useConnectivity(): ConnectivityView {
  const { connectivity } = useServices();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [justReconnected, setJustReconnected] = useState(false);
  const lastKnown = useRef<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const update = (next: boolean | null): void => {
      if (!active || next === null) return;
      if (lastKnown.current === false && next) setJustReconnected(true);
      lastKnown.current = next;
      setIsOnline(next);
    };

    let receivedNetworkEvent = false;
    const unsubscribe = connectivity.subscribe((next) => {
      receivedNetworkEvent = true;
      update(next);
    });
    void connectivity
      .getIsOnline()
      .then((next) => {
        if (!receivedNetworkEvent) update(next);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [connectivity]);

  useEffect(() => {
    if (!justReconnected) return;
    const timeout = setTimeout(() => setJustReconnected(false), 5000);
    return () => clearTimeout(timeout);
  }, [justReconnected]);

  return { isOnline, isOffline: isOnline === false, justReconnected };
}
