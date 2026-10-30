/**
 * useWaitingRoom — adaptive-poll waiting-room seam (RBT-042/043/044).
 *
 * One poller per session (TanStack Query owns the single interval and cancels
 * it on unmount — no request storm, NFR-05/06). The poll interval is the
 * server's `nextPollAfterMs` honoured through `pollIntervalMs` (RBT-042). On
 * ADMITTED it auto-claims once (creates the booking session, FR-08) and reports
 * the booking `sessionId` so the screen can route to checkout.
 *
 * TanStack Query is confined to this hook (the D3 seam).
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { ClaimAdmission } from "@application/use-cases/claim-admission";
import { ObserveQueue, LeaveQueue } from "@application/use-cases/observe-queue";
import type { QueueEntry } from "@domain/repositories/queue.repository";
import {
  isAdmitted,
  isTerminal,
  phaseFor,
  pollIntervalMs,
  type WaitingPhase,
} from "@domain/rules/queue-display";
import { useServices } from "@providers/service-context";
import { useSessionStore } from "@presentation/stores/session-store";

export interface WaitingRoomView {
  /** Latest queue entry (undefined until the first poll resolves). */
  readonly entry?: QueueEntry;
  readonly phase: WaitingPhase;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
  /** The booking session id once admission is claimed (→ route to checkout). */
  readonly claimedSessionId?: string;
  /** True while the claim is in flight. */
  readonly claiming: boolean;
  /** Leave the queue (abandon the slot). */
  readonly leave: () => void;
}

export function useWaitingRoom(queueId: string, eventId: string): WaitingRoomView {
  const { queueRepository, bookingRepository } = useServices();
  const setQueueStatus = useSessionStore((s) => s.setQueueStatus);
  const setSession = useSessionStore((s) => s.setSession);

  const [claimedSessionId, setClaimedSessionId] = useState<string | undefined>();
  const claimedOnce = useRef(false);

  const query = useQuery<QueueEntry, Error>({
    queryKey: ["queue", queueId],
    queryFn: () => new ObserveQueue(queueRepository).execute(queueId),
    enabled: queueId.length > 0,
    // Adaptive, single poller. Stop polling once terminal or admitted.
    refetchInterval: (q) => {
      const data = q.state.data;
      if (!data) return 2000;
      if (isTerminal(data.status) || isAdmitted(data.status)) return false;
      return pollIntervalMs(data);
    },
  });

  const claim = useMutation({
    mutationFn: () => new ClaimAdmission(bookingRepository).execute(eventId),
    onSuccess: (session) => {
      setSession(session.sessionId);
      setClaimedSessionId(session.sessionId);
    },
  });

  // Mirror the observed status into the session store, and auto-claim ONCE on
  // admission (FR-08 — no button).
  const status = query.data?.status;
  useEffect(() => {
    if (!status) return;
    setQueueStatus(status);
    if (isAdmitted(status) && !claimedOnce.current) {
      claimedOnce.current = true;
      claim.mutate();
    }
  }, [status, setQueueStatus, claim]);

  const leave = (): void => {
    if (queueId.length > 0) new LeaveQueue(queueRepository).execute(queueId);
  };

  return {
    entry: query.data,
    phase: status ? phaseFor(status) : "waiting",
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    claimedSessionId,
    claiming: claim.isPending,
    leave,
  };
}
