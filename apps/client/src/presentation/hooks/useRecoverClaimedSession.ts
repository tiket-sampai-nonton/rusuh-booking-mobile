/**
 * useRecoverClaimedSession — resume a checkout whose queue entry is already CLAIMED.
 *
 * A CLAIMED entry means the admission token was spent on a booking session. If the
 * user left checkout unexpectedly (back, refresh, app kill) the session may still be
 * alive, so ask `GET /booking-sessions/current` instead of dead-ending:
 *   - 200 → `sessionId` (caller routes to /checkout/{sessionId}; never re-claim);
 *   - 404 → `expired` (caller offers "masuk antrean lagi");
 *   - failure → `error` (caller offers a retry).
 */
import { useCallback, useEffect, useMemo, useState } from "react";

import { RestoreBookingSession } from "@application/booking/restore-booking-session.use-case";
import { useServices } from "@providers/service-context";

export type RecoverState = "idle" | "checking" | "expired" | "error";

export function useRecoverClaimedSession(eventId?: string, enabled = false) {
  const { bookingRepository } = useServices();
  const restore = useMemo(
    () => new RestoreBookingSession(bookingRepository),
    [bookingRepository],
  );
  const [state, setState] = useState<RecoverState>("idle");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled || !eventId) return;
    let cancelled = false;
    setState("checking");
    restore
      .execute(undefined, eventId)
      .then((session) => {
        if (cancelled) return;
        if (session) setSessionId(session.sessionId);
        else setState("expired");
      })
      .catch((cause: { code?: string }) => {
        if (cancelled) return;
        setState(cause?.code === "SESSION_EXPIRED" ? "expired" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, eventId, restore, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, sessionId, retry };
}
