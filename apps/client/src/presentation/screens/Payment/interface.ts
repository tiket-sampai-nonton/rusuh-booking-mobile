/** Payment screen prop + fragment types. */
import type { PaymentMethod } from "@domain/repositories/payment.repository";

export interface PaymentScreenProps {
  readonly bookingId: string;
}

export interface PaymentTopBarProps {
  readonly remainingMs: number;
  readonly warn: boolean;
  readonly expired: boolean;
  readonly onBack: () => void;
}

export interface PaymentSummaryProps {
  readonly bookingId: string;
  readonly amountMinor?: number;
}

export interface PaymentMethodsProps {
  readonly selected: PaymentMethod | null;
  readonly onSelect: (code: PaymentMethod) => void;
}

export interface PaymentBarProps {
  readonly amountMinor?: number;
  readonly canPay: boolean;
  readonly pending: boolean;
  readonly expired: boolean;
  readonly errorMessage?: string;
  readonly onPay: () => void;
  readonly bottomInset: number;
}
