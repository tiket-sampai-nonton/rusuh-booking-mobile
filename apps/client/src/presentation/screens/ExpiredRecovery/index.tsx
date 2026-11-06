/**
 * ExpiredRecoveryScreen — failure/expiry recovery (RBT-064, E7 Payment,
 * AC1/FR-23). Rendered behind `/expired/[resourceId]`.
 * RBT-097 — Mobile: white background (not dark), add "turn" variant.
 *
 * Decides the RIGHT recovery from the authoritative state (never the callback,
 * never the device clock):
 *   • FAILED + still payable (deadline not passed, no not-payable code) → offer
 *     RETRY: go back to the payment page to start a NEW attempt.
 *   • BOOKING_NOT_PAYABLE / deadline passed → there is nothing to retry; offer
 *     the RE-QUEUE path (back to the event's waiting room, else browse).
 *
 * noindex: a crawler must never see a transactional failure state (SECURITY §6.5).
 */
import { useRouter, type Href } from "expo-router";
import { Platform, View } from "react-native";

import type { PaymentStatus } from "@domain/repositories/payment.repository";
import {
  decideRecovery,
  requeueRoute,
  type ExpiryReason,
} from "@domain/rules/payment-recovery";
import { Seo } from "@presentation/components/Seo";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { RecoveryActions } from "./fragments/RecoveryActions";
import { RecoveryInfo } from "./fragments/RecoveryInfo";
import { RecoveryMessage } from "./fragments/RecoveryMessage";
import { EXPIRY_COPY } from "./recovery-copy";
import { styles } from "./style";

export interface ExpiredRecoveryScreenProps {
  readonly resourceId: string;
  /** Why we are here (payment / hold / queue / turn). Defaults to a generic expiry. */
  readonly reason?: ExpiryReason;
  /** Booking to retry paying (when payable). */
  readonly bookingId?: string;
  /** Event to re-queue for. */
  readonly eventId?: string;
  /** Authoritative status + terminal error code, when known. */
  readonly status?: PaymentStatus;
  readonly errorCode?: string;
  /** Server-reconciled ms left on the deadline (<=0 = passed). */
  readonly remainingMs?: number;
}

export function ExpiredRecoveryScreen({
  resourceId,
  reason = "queue",
  bookingId,
  eventId,
  status,
  errorCode,
  remainingMs = 0,
}: ExpiredRecoveryScreenProps) {
  const router = useRouter();
  const { isMobileWeb } = useResponsive();
  const recovery = decideRecovery(status, remainingMs, errorCode);
  const copy = EXPIRY_COPY[reason];

  // Retry is only reachable when canRetry (below) is true, which already
  // requires a bookingId — so no redundant guard here.
  const onRetry = (): void => {
    router.replace(`/payment/${bookingId}` as Href);
  };
  const onRequeue = (): void => {
    router.replace(requeueRoute(reason, eventId) as Href);
  };

  const canRetry = recovery.kind === "retry" && !!bookingId;

  // Primary button text based on reason
  const primaryText = primaryButtonText(canRetry, reason, eventId);

  return (
    <View
      className={
        isMobileWeb
          ? "flex-1 items-center gap-4 px-4 py-8"
          : "flex-1 items-center justify-center gap-6 p-6"
      }
      style={[styles.screen, isMobileWeb && styles.mobileWebScreen]}
      testID="expired-recovery"
    >
      <Seo
        title="Kedaluwarsa"
        description="Waktu sesi telah berakhir."
        path={`/expired/${resourceId}`}
        noindex
      />
      <View className="w-full max-w-sm items-center gap-4">
        <RecoveryMessage reason={reason} title={copy.title} body={copy.body} />
        <RecoveryInfo text={copy.infoText} items={copy.infoList} />
      </View>
      <RecoveryActions
        canRetry={canRetry}
        primaryText={primaryText}
        showHome={Platform.OS !== "web"}
        onRetry={onRetry}
        onRequeue={onRequeue}
        onHome={() => router.replace("/" as Href)}
      />
    </View>
  );
}

function primaryButtonText(
  canRetry: boolean,
  reason: ExpiryReason,
  eventId?: string,
): string {
  if (canRetry) return "Coba Lagi";
  if (reason === "queue" || reason === "turn" || !eventId)
    return "Cari Event Lain";
  return "Masuk Antrean Lagi";
}
