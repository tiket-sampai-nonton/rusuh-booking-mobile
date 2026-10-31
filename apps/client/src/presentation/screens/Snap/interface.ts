/** SnapSimulator screen prop + fragment types. */
import type { PaymentMethod } from "@domain/repositories/payment.repository";

export interface SnapSimulatorScreenProps {
  readonly bookingId: string;
}

/** A single Order ID / Metode / Total summary row. */
export interface SnapSummaryRowProps {
  readonly label: string;
  readonly value: string;
}

export interface SnapSummaryProps {
  readonly bookingId: string;
  readonly method?: PaymentMethod;
  readonly amountMinor?: number;
}

export interface SnapActionsProps {
  readonly onSuccess: () => void;
  readonly onFail: () => void;
}
