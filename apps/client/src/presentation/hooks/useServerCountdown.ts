/**
 * useServerCountdown — a server-authoritative countdown (RBT-050/060).
 *
 * Drives a 1s tick that reports `remainingMs` from the injected `ServerClock`
 * (NEVER the device clock, D3.2). When `serverTimeIso` is supplied the clock is
 * synced to it first, so a skewed device clock cannot extend or shorten the
 * deadline. Reaching 0 fires `onExpire` once. Reduced-motion is irrelevant
 * (there is no animation) — this is a logical timer.
 */
import { useEffect, useRef, useState } from "react";

import type { ServerClock } from "@domain/services/server-clock";

export interface CountdownOptions {
  readonly clock: ServerClock;
  /** Server deadline (ISO-8601). */
  readonly expiresAtIso?: string;
  /** Server time at issue (ISO-8601) — syncs the clock offset once. */
  readonly serverTimeIso?: string;
  readonly onExpire?: () => void;
}

export function useServerCountdown({
  clock,
  expiresAtIso,
  serverTimeIso,
  onExpire,
}: CountdownOptions): { remainingMs: number; expired: boolean } {
  const [remainingMs, setRemainingMs] = useState(0);
  const firedExpire = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Sync the clock once per serverTime value.
  useEffect(() => {
    if (serverTimeIso) clock.sync(serverTimeIso);
  }, [clock, serverTimeIso]);

  useEffect(() => {
    if (!expiresAtIso) return;
    firedExpire.current = false;

    const tick = (): void => {
      const left = clock.remaining(expiresAtIso);
      setRemainingMs(left);
      if (left <= 0 && !firedExpire.current) {
        firedExpire.current = true;
        onExpireRef.current?.();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [clock, expiresAtIso]);

  return { remainingMs, expired: remainingMs <= 0 && !!expiresAtIso };
}
