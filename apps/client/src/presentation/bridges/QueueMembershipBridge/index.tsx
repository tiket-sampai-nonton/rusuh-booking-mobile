import { useEffect, useRef, useState } from "react";
import {
  usePathname,
  useRootNavigationState,
  useRouter,
  type Href,
} from "expo-router";

import { useRestoreBookingSession } from "@presentation/hooks/useBookingSession";
import { DomainError } from "@domain/errors/domain-error";
import {
  useClearQueueMembership,
  useRestoreMembership,
} from "@presentation/hooks/useRestoreMembership";
import { useServices } from "@providers/service-context";

/** Resume a persisted queue membership on app launch, including claimed holds. */
export function QueueMembershipBridge() {
  const pathname = usePathname();
  const rootNavigation = useRootNavigationState();
  const router = useRouter();
  const { paymentJourneyStorage } = useServices();
  const clearQueueMembership = useClearQueueMembership();
  const [paymentChecked, setPaymentChecked] = useState(false);
  const [hasPayment, setHasPayment] = useState(false);
  const onLandingRoute = pathname === "/" || pathname === "/browse";
  useEffect(() => {
    let active = true;
    if (!onLandingRoute) {
      setPaymentChecked(false);
      return () => {
        active = false;
      };
    }
    void paymentJourneyStorage
      .load()
      .then((reference) => {
        if (!active) return;
        setHasPayment(Boolean(reference?.bookingId));
        setPaymentChecked(true);
      })
      .catch(() => {
        // A failed storage read must not let an older queue override payment.
      });
    return () => {
      active = false;
    };
  }, [onLandingRoute, paymentJourneyStorage]);
  const canRestore = Boolean(
    rootNavigation?.key && onLandingRoute && paymentChecked && !hasPayment,
  );
  const { resumed } = useRestoreMembership(canRestore);
  const claimed =
    canRestore && resumed?.entry.status === "CLAIMED" ? resumed : null;
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
    } else if (
      booking.error instanceof DomainError &&
      (booking.error.code === "SESSION_EXPIRED" ||
        booking.error.code === "SESSION_INVALID")
    ) {
      // The BE confirmed this claimed checkout is terminal. Reopening the
      // waiting route would replay its one-use admission token and strand the
      // user in an unauthorized queue screen.
      void clearQueueMembership()
        .catch(() => undefined)
        .then(() => router.replace("/" as Href));
    } else if (booking.error) {
      // Keep an unverified session recoverable; the waiting screen can retry
      // when connectivity returns instead of asserting it has expired.
      router.replace(
        `/waiting/${claimed.membership.eventId}?queueId=${queueId}` as Href,
      );
    } else if (booking.session === null) {
      // A confirmed absent hold cannot be resumed. Forget its claimed queue so
      // a future visit can start a new journey.
      void clearQueueMembership()
        .then(() => router.replace("/" as Href))
        .catch(() => undefined);
    }
  }, [
    booking.isLoading,
    booking.error,
    booking.session,
    claimed,
    clearQueueMembership,
    queueId,
    router,
  ]);

  return null;
}
