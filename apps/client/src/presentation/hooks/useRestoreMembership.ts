/**
 * useRestoreMembership — restore-on-startup seam (RBT-041, E5 Queue).
 *
 * On app load, run {@link RestoreMembership} (load persisted membership →
 * re-fetch live status → ACTIVE resume / TERMINAL clear per the RBT-040 state
 * machine). When a membership is resumable it navigates ONCE into the waiting
 * room (`/waiting/<eventId>?queueId=<id>`); when there is nothing to resume it
 * is a no-op (a terminal/dead pointer is cleared inside the use case).
 *
 * The swap seam: TanStack Query lives HERE (presentation). The backend/storage
 * is reached only through {@link RestoreMembership} → the frozen
 * {@link QueueRepository} + {@link QueueMembershipStorage} ports via
 * `useServices()`; no concrete adapter is named, no infrastructure imported
 * (ARCHITECTURE §3, §4.3).
 *
 * ROUTING: the navigation fires once, guarded by a ref so a re-render (or
 * StrictMode double-invoke) never double-navigates. `enabled` lets a caller
 * defer the restore until the router/layout is ready.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  RestoreMembership,
  type ResumedMembership,
} from "@application/queue/restore-membership.use-case";
import { useServices } from "@providers/service-context";

export interface UseRestoreMembershipResult {
  /** True while the restore query is in flight. */
  readonly isRestoring: boolean;
  /** The resumable membership + fresh entry, or null when nothing to resume. */
  readonly resumed: ResumedMembership | null;
}

export const QUEUE_MEMBERSHIP_RESTORE_QUERY_KEY = [
  "queue-membership",
  "restore",
] as const;

/** Clear the persisted and cached queue pointer after a confirmed journey end. */
export function useClearQueueMembership(): () => Promise<void> {
  const { queueMembership } = useServices();
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await queryClient.cancelQueries({
      queryKey: QUEUE_MEMBERSHIP_RESTORE_QUERY_KEY,
    });
    queryClient.setQueryData(QUEUE_MEMBERSHIP_RESTORE_QUERY_KEY, null);
    await queueMembership.clear();
  }, [queryClient, queueMembership]);
}

/**
 * Restore and resume any persisted waiting-room membership on startup.
 *
 * @param enabled  gate the restore (e.g. until the router is ready). Default true.
 */
export function useRestoreMembership(
  enabled = true,
): UseRestoreMembershipResult {
  const { queueRepository, queueMembership } = useServices();
  const router = useRouter();

  const restore = useMemo(
    () => new RestoreMembership(queueRepository, queueMembership),
    [queueRepository, queueMembership],
  );

  const query = useQuery<ResumedMembership | null, Error>({
    queryKey: QUEUE_MEMBERSHIP_RESTORE_QUERY_KEY,
    queryFn: () => restore.execute(),
    enabled,
    // The persisted pointer is read once per app start; the live status it
    // resolves to is owned by the waiting room's poller, not refetched here.
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const resumed = query.data ?? null;

  // Navigate at most once into the waiting room for a resumable membership.
  const navigatedTo = useRef<string | null>(null);
  useEffect(() => {
    if (resumed === null) return;
    // A claimed queue entry is no longer a waiting room. The startup bridge
    // restores its current booking session and routes directly to checkout.
    if (resumed.entry.status === "CLAIMED") return;
    const { eventId, queueId } = resumed.membership;
    if (navigatedTo.current === queueId) return;
    navigatedTo.current = queueId;
    router.push(`/waiting/${eventId}?queueId=${queueId}` as Href);
  }, [resumed, router]);

  return { isRestoring: query.isLoading, resumed };
}
