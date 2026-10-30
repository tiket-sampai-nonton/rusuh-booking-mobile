/**
 * useJoinQueue — TanStack mutation seam for the anonymous waiting-room join
 * (RBT-032 CTA → RBT-041). On success it records the issued queue entry in the
 * session store so the waiting-room screen can resume it.
 */
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { JoinQueue } from "@application/use-cases/join-queue";
import type { QueueEntry } from "@domain/repositories/queue.repository";
import { useServices } from "@providers/service-context";
import { useSessionStore } from "@presentation/stores/session-store";

export function useJoinQueue(): UseMutationResult<QueueEntry, Error, string> {
  const { queueRepository } = useServices();
  const setQueue = useSessionStore((s) => s.setQueue);
  return useMutation<QueueEntry, Error, string>({
    mutationFn: (eventId: string) => new JoinQueue(queueRepository).execute(eventId),
    onSuccess: (entry) => {
      setQueue(entry.eventId, entry.queueId, entry.status);
    },
  });
}
