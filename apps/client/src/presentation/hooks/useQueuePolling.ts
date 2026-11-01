/**
 * useQueuePolling — adaptive waiting-room polling seam (RBT-042, E5 Queue,
 * ARCHITECTURE §9.2, NFR-05/06).
 *
 * ONE poller per session. TanStack Query owns the single interval for the
 * `["queue", queueId]` key and cancels it on unmount — there is no hand-rolled
 * `setInterval`, so there is no request storm and no leaked timer (NFR-05/06).
 * The cadence is the SERVER's `nextPollAfterMs` turned into a wait by the pure
 * `pollIntervalMs` rule (RBT-042) with an anti-storm floor + additive jitter.
 * Polling STOPS (returns `false`) the moment the entry is terminal or admitted
 * — a settled entry never polls again.
 *
 * TanStack Query is confined to this hook (the D3 swap seam). The hook reaches
 * the backend ONLY through the `ObserveQueue` use case → the frozen
 * `QueueRepository` port, read from the DI container via `useServices()`; it
 * names no concrete adapter and imports no infrastructure (ARCHITECTURE §3,
 * §4.3). Admission/claim is a SEPARATE ticket (RBT-044) and the waiting SCREEN
 * is RBT-043 — neither is built here.
 */
import { useQuery, type Query } from "@tanstack/react-query";
import { useMemo } from "react";

import { ObserveQueue } from "@application/queue/observe-queue.use-case";
import { LeaveQueue } from "@application/queue/leave-queue.use-case";
import type { QueueEntry } from "@domain/repositories/queue.repository";
import { pollIntervalMs } from "@domain/rules/queue-polling";
import {
  isAdmitted,
  isTerminal,
} from "@domain/state-machines/queue-state-machine";
import { useServices } from "@providers/service-context";

/** What the waiting room reads off the single poller. */
export interface QueuePollingView {
  /** Latest queue entry (undefined until the first poll resolves). */
  readonly entry?: QueueEntry;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
  /**
   * True once the entry has settled (terminal OR admitted) — the poller has
   * stopped. The screen (RBT-043) / claim (RBT-044) react to this.
   */
  readonly isSettled: boolean;
  /** Leave the waiting room (abandons the slot). */
  readonly leave: () => Promise<void>;
}

/**
 * The adaptive `refetchInterval` decision, factored out of the hook so it is
 * unit-testable WITHOUT timers: return `false` (stop polling) when there is a
 * settled entry (terminal OR admitted); otherwise the jittered adaptive wait
 * from the pure rule. With no data yet, poll at the floor to get the first real
 * `nextPollAfterMs`.
 *
 * `reducedMotion` raises the floor; `random` is injectable for deterministic
 * tests (production uses `Math.random` inside `pollIntervalMs`).
 */
export function computeRefetchInterval(
  entry: QueueEntry | undefined,
  reducedMotion = false,
  random?: () => number,
): number | false {
  if (entry && (isTerminal(entry.status) || isAdmitted(entry.status))) {
    return false;
  }
  return pollIntervalMs(entry ?? {}, reducedMotion, random);
}

/**
 * Poll the waiting room for `queueId` on the server-driven adaptive cadence.
 *
 * @param queueId  the entry to observe; polling is disabled while empty.
 * @param reducedMotion  raise the poll floor for reduced-motion users.
 */
export function useQueuePolling(
  queueId: string,
  reducedMotion = false,
): QueuePollingView {
  const { queueRepository } = useServices();

  // One use-case instance per repository binding (stable across re-renders).
  const { observe, leaveQueue } = useMemo(
    () => ({
      observe: new ObserveQueue(queueRepository),
      leaveQueue: new LeaveQueue(queueRepository),
    }),
    [queueRepository],
  );

  const query = useQuery<QueueEntry, Error>({
    queryKey: ["queue", queueId],
    queryFn: () => observe.execute(queueId),
    enabled: queueId.length > 0,
    // The SINGLE adaptive poller. Stop on terminal/admitted; else the jittered
    // server-honoured wait. TanStack cancels this interval on unmount.
    refetchInterval: (query: Query<QueueEntry, Error>) =>
      computeRefetchInterval(query.state.data, reducedMotion),
  });

  const entry = query.data;
  const isSettled =
    entry !== undefined && (isTerminal(entry.status) || isAdmitted(entry.status));

  return {
    entry,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isSettled,
    leave: () => leaveQueue.execute(queueId),
  };
}
