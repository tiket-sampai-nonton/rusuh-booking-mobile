/** Payment screen prop + fragment types. */
import type { PaymentMethod } from "@domain/repositories/payment.repository";

export interface PaymentScreenProps {
  readonly bookingId: string;
}

export interface PaymentTopBarProps {
  readonly remainingMs: number;
  readonly warn: boolean;
  readonly expired: boolean;
  readonly isMobileWeb?: boolean;
  readonly onBack: () => void;
}

export interface PaymentSummaryProps {
  readonly bookingId: string;
  readonly amountMinor?: number;
}

export interface PaymentMethodsProps {
  /** Server-allowed methods for this booking (RBT-060 AC2, page.methods). */
  readonly methods: readonly PaymentMethod[];
  readonly selected: PaymentMethod | null;
  readonly onSelect: (code: PaymentMethod) => void;
}

export interface PaymentBarProps {
  readonly amountMinor?: number;
  readonly canPay: boolean;
  readonly pending: boolean;
  readonly expired: boolean;
  readonly errorMessage?: string;
  /** When set (an in-flight attempt), the CTA reads this instead of "Bayar" (AC2). */
  readonly resumeLabel?: string;
  readonly onPay: () => void;
  readonly bottomInset: number;
}
