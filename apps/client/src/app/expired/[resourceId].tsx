import { useLocalSearchParams } from "expo-router";

import type { PaymentStatus } from "@domain/repositories/payment.repository";
import type { ExpiryReason } from "@domain/rules/payment-recovery";
import { ExpiredRecoveryScreen } from "@presentation/screens/ExpiredRecovery";

// Top-level route `/expired/[resourceId]` — RBT-064 failure/expiry recovery
// (queue session / booking hold / payment). The screen decides retry vs
// re-queue from the reason + authoritative state. noindex is set by the
// screen's own <Seo> (transactional state, SECURITY §6.5).
export default function ExpiredRoute() {
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
    ["payment", "hold", "queue"].includes(params.reason ?? "")
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
