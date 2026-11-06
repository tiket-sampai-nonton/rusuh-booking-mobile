/**
 * useJoinQueue — presentation seam for the anonymous waiting-room join
 * (RBT-041, E5 Queue; EventDetail CTA → waiting room). A TanStack mutation that
 * wraps the {@link JoinQueue} use case; on success it routes to the waiting room
 * (`/waiting/<eventId>?queueId=<id>`) which RBT-043 renders.
 *
 * The swap seam: TanStack Query lives HERE (presentation), never in the use
 * case or the domain. The backend is reached only through {@link JoinQueue} →
 * the frozen {@link QueueRepository} + {@link QueueMembershipStorage} ports read
 * from the DI container via `useServices()` — it names no concrete adapter and
 * imports no infrastructure (ARCHITECTURE §3, §4.3).
 *
 * The join is anonymous (D8.5 guest flow): no auth, buyer NIK/email is collected
 * later at checkout. Persistence (so a refresh restores the slot) happens inside
 * the use case, not here.
 */
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";
import { useMemo } from "react";

import { JoinQueue } from "@application/queue/join-queue.use-case";
import type { QueueEntry } from "@domain/repositories/queue.repository";
import { useServices } from "@providers/service-context";

/**
 * Join the waiting room for an event.
 *
 * Returns the TanStack mutation (call `.mutate(eventId)` / `.mutateAsync`).
 * `onSuccess` navigates to the waiting room with the issued `queueId` so the
 * screen resumes polling the exact entry.
 */
export function useJoinQueue(): UseMutationResult<QueueEntry, Error, string> {
  const { queueRepository, queueMembership } = useServices();
  const router = useRouter();

  const join = useMemo(
    () => new JoinQueue(queueRepository, queueMembership),
    [queueRepository, queueMembership],
  );

  return useMutation<QueueEntry, Error, string>({
    mutationFn: (eventId: string) => join.execute(eventId),
    onSuccess: (entry) => {
      router.push(`/waiting/${entry.eventId}?queueId=${entry.queueId}` as Href);
    },
  });
}
