import { useLocalSearchParams } from "expo-router";

import type { PaymentStatus } from "@domain/repositories/payment.repository";
import type { ExpiryReason } from "@domain/rules/payment-recovery";
import { ExpiredRecoveryScreen } from "@presentation/screens/ExpiredRecovery";

/** User-facing failure route for payment, booking, and queue recovery. */
export default function FailedRoute() {
  const params = useLocalSearchParams<{
    resourceId: string;
    reason?: string;
    bookingId?: string;
    eventId?: string;
    status?: string;
    errorCode?: string;
    remainingMs?: string;
  }>();
  const reason = (
    ["payment", "hold", "queue", "turn"].includes(params.reason ?? "")
      ? params.reason
      : undefined
  ) as ExpiryReason | undefined;
  const remainingMs = params.remainingMs
    ? Number(params.remainingMs)
    : undefined;
  return (
    <ExpiredRecoveryScreen
      resourceId={params.resourceId ?? ""}
      reason={reason}
      bookingId={params.bookingId}
      eventId={params.eventId}
      status={params.status as PaymentStatus | undefined}
      errorCode={params.errorCode}
      remainingMs={remainingMs}
    />
  );
}
