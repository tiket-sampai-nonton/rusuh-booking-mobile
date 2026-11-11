import { useEffect, useRef } from "react";
import {
  usePathname,
  useRootNavigationState,
  useRouter,
  type Href,
} from "expo-router";

import { useRestoreBookingSession } from "@presentation/hooks/useBookingSession";
import { useRestoreMembership } from "@presentation/hooks/useRestoreMembership";

/** Resume a persisted queue membership on app launch, including claimed holds. */
export function QueueMembershipBridge() {
  const pathname = usePathname();
  const rootNavigation = useRootNavigationState();
  const router = useRouter();
  const onLandingRoute = pathname === "/" || pathname === "/browse";
  const { resumed } = useRestoreMembership(
    Boolean(rootNavigation?.key && onLandingRoute),
  );
  const claimed = resumed?.entry.status === "CLAIMED" ? resumed : null;
  const eventId = claimed?.membership.eventId;
  const queueId = claimed?.membership.queueId;
  const booking = useRestoreBookingSession(
    Boolean(claimed),
    undefined,
    eventId,
  );
  const handledQueue = useRef<string | null>(null);

  useEffect(() => {
    if (!claimed || !queueId || handledQueue.current === queueId) return;
    if (booking.isLoading) return;

    handledQueue.current = queueId;
    if (booking.session?.sessionId) {
      router.replace(`/checkout/${booking.session.sessionId}` as Href);
    } else {
      // Let the waiting screen show a retryable recovery state if the session
      // restore failed or the claimed entry no longer has an active session.
      router.replace(
        `/waiting/${claimed.membership.eventId}?queueId=${queueId}` as Href,
      );
    }
  }, [booking.isLoading, booking.session?.sessionId, claimed, queueId, router]);

  return null;
}
