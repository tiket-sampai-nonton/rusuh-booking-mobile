import { usePathname, useRouter, type Href } from "expo-router";
import { useEffect, useRef } from "react";

import { useServices } from "@providers/service-context";

/** Reopens an interrupted payment route; the payment page then gates it with BE status. */
export function PaymentJourneyRecoveryBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const { paymentJourneyStorage } = useServices();
  const checkedAtHome = useRef(false);

  useEffect(() => {
    if (pathname !== "/" || checkedAtHome.current) return;
    checkedAtHome.current = true;
    void paymentJourneyStorage
      .load()
      .then((reference) => {
        if (reference?.bookingId) {
          const eventQuery = reference.eventId
            ? `?eventId=${encodeURIComponent(reference.eventId)}`
            : "";
          router.replace(
            `/payment/${encodeURIComponent(reference.bookingId)}${eventQuery}` as Href,
          );
        }
      })
      .catch(() => undefined);
  }, [pathname, paymentJourneyStorage, router]);

  return null;
}
