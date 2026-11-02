/**
 * useAttendeeCheck — debounced attendee-NIK availability check (RBT-052 AC2).
 *
 * The checkout screen calls `request(nik)` as the user types a 16-digit
 * attendee NIK. Requests are DEBOUNCED (default 500ms) and de-duplicated: a NIK
 * already resolved is not re-queried, and only the latest NIK per debounce
 * window hits the backend. Verdicts are returned as a map keyed by NIK so the
 * screen can (a) show per-row status and (b) feed `attendeeChecks` into
 * `isCheckoutReady` (ALREADY_REGISTERED blocks, CHECK_LIMIT_REACHED warns).
 *
 * TanStack is not used here because the trigger is a debounced imperative call
 * on free text, not a declarative query key; the use case is still reached
 * through the frozen {@link BookingRepository} port via `useServices()` — no
 * infrastructure import (ARCHITECTURE §3/§4.3).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CheckAttendee } from "@application/booking/check-attendee.use-case";
import type { AttendeeCheckResult } from "@domain/rules/checkout";
import { isValidNik } from "@domain/rules/checkout";
import { useServices } from "@providers/service-context";

export interface UseAttendeeCheck {
  /** Verdicts resolved so far, keyed by NIK. */
  readonly checks: Readonly<Record<string, AttendeeCheckResult>>;
  /** NIKs currently in flight (for a per-row spinner). */
  readonly pending: Readonly<Record<string, boolean>>;
  /** Debounced request for a NIK (ignored unless 16 digits). */
  readonly request: (nik: string) => void;
}

export function useAttendeeCheck(
  sessionId: string,
  debounceMs = 500,
): UseAttendeeCheck {
  const { bookingRepository } = useServices();
  const usecase = useMemo(
    () => new CheckAttendee(bookingRepository),
    [bookingRepository],
  );

  const [checks, setChecks] = useState<Record<string, AttendeeCheckResult>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest snapshots so the debounced callback never reads stale state.
  const checksRef = useRef(checks);
  checksRef.current = checks;
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  const run = useCallback(
    async (nik: string): Promise<void> => {
      // Skip when already resolved or already in flight.
      if (checksRef.current[nik] || pendingRef.current[nik]) return;
      setPending((p) => ({ ...p, [nik]: true }));
      try {
        const res = await usecase.execute(sessionId, nik);
        setChecks((c) => ({ ...c, [nik]: res.result }));
      } finally {
        setPending((p) => {
          const next = { ...p };
          delete next[nik];
          return next;
        });
      }
    },
    [sessionId, usecase],
  );

  const request = useCallback(
    (nik: string): void => {
      if (!isValidNik(nik)) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void run(nik);
      }, debounceMs);
    },
    [run, debounceMs],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { checks, pending, request };
}
