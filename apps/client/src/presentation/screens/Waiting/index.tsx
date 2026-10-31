/**
 * Waiting room PageScreen (folder index) — parent component (orchestration only).
 *
 * 1:1 of the prototype `waiting.html` (RBT-043/044, E5). Wiring: useWaitingRoom
 * (one adaptive poller) → use cases → ports → mock. On admission it auto-claims
 * and routes to checkout; refresh-safe (queueId from the session store). Picks
 * the state fragment to render; markup → ./fragments, styles → ./style, types →
 * ./interface (presentation refactor rule).
 */
import { useRouter, type Href } from "expo-router";
import { useEffect } from "react";

import { isTerminal } from "@domain/rules/queue-display";
import { useWaitingRoom } from "@presentation/hooks/useWaitingRoom";
import { useSessionStore } from "@presentation/stores/session-store";

import { LeaveLink } from "./fragments/common";
import { Shell } from "./fragments/Shell";
import { WaitingActive, Eyebrow } from "./fragments/WaitingActive";
import {
  WaitingError,
  WaitingLoading,
  WaitingNoQueue,
  WaitingTerminal,
} from "./fragments/WaitingStates";
import type { WaitingRoomScreenProps } from "./interface";

export function WaitingRoomScreen({ eventId }: WaitingRoomScreenProps) {
  const router = useRouter();
  const queueId = useSessionStore((s) => s.queueId) ?? "";
  const { entry, isLoading, isError, error, claimedSessionId, claiming, leave } =
    useWaitingRoom(queueId, eventId);

  // Auto-advance to checkout once admission is claimed (FR-08).
  useEffect(() => {
    if (claimedSessionId) {
      router.replace(`/checkout/${claimedSessionId}` as Href);
    }
  }, [claimedSessionId, router]);

  const onLeave = (): void => {
    leave();
    router.replace("/" as Href);
  };

  if (!queueId) return <WaitingNoQueue onLeave={onLeave} />;
  if (isLoading) return <WaitingLoading onLeave={onLeave} />;
  if (isError || !entry) return <WaitingError message={error?.message} onLeave={onLeave} />;
  if (isTerminal(entry.status)) return <WaitingTerminal status={entry.status} onLeave={onLeave} />;

  return (
    <Shell testID="waiting-active" pillLabel="Waiting Room">
      <Eyebrow />
      <WaitingActive entry={entry} claiming={claiming} />
      <LeaveLink label="Keluar dari antrean" onPress={onLeave} disabled={claiming} />
    </Shell>
  );
}
