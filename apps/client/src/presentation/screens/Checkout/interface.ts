/** Checkout screen prop + fragment types. */
import type { ReactNode } from "react";

import type { TicketRow } from "@domain/rules/checkout";
import type { BookingCategory } from "@domain/repositories/booking.repository";

export interface CheckoutScreenProps {
  readonly sessionId: string;
}

export interface SectionProps {
  readonly title: string;
  readonly number?: number;
  readonly children: ReactNode;
}

export interface FieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (t: string) => void;
  readonly placeholder?: string;
  readonly keyboardType?: "number-pad" | "email-address" | "default";
  readonly testID?: string;
  readonly invalid?: boolean;
  readonly editable?: boolean;
  readonly errorMessage?: string;
  readonly helperText?: string;
}

export interface CheckoutTopBarProps {
  readonly remainingMs: number;
  readonly warn: boolean;
  readonly expired: boolean;
  readonly onBack: () => void;
}

export interface CheckoutHeroProps {
  readonly eventId: string;
  readonly eventName?: string;
  readonly eventNameError?: boolean;
  readonly isMobileWeb?: boolean;
  readonly onRetryEventName?: () => void;
}

/** Per-row attendee-check status for the ticket row (RBT-052). */
export type RowCheckStatus =
  | "idle"
  | "checking"
  | "available"
  | "blocked"
  | "warning";

export interface TicketItemProps {
  readonly index: number;
  readonly row: TicketRow;
  readonly canRemove: boolean;
  readonly onRemove: () => void;
  readonly onPatch: (p: Partial<TicketRow>) => void;
  readonly onUseBuyer: (on: boolean) => void;
  /** Attendee-NIK availability status for this row (RBT-052 AC2). */
  readonly status?: RowCheckStatus;
  readonly categories: readonly BookingCategory[];
  readonly buyerName?: string;
  readonly buyerNik?: string;
  readonly categoryError?: string;
  readonly attendeeNameError?: string;
  readonly attendeeNikError?: string;
}

export interface ConsentGateProps {
  readonly checked: boolean;
  readonly onToggle: (on: boolean) => void;
  readonly onOpenPrivacy: () => void;
  readonly errorMessage?: string;
}

export interface CheckoutBarProps {
  readonly totalMinor: number;
  /** @deprecated Kept for compatibility; invalid forms remain actionable to show errors. */
  readonly ready?: boolean;
  readonly pending: boolean;
  readonly expired: boolean;
  readonly errorMessage?: string;
  readonly errorActionLabel?: string;
  readonly onErrorAction?: () => void;
  readonly onSubmit: () => void;
  readonly bottomInset: number;
}

export interface LeaveConfirmProps {
  readonly visible: boolean;
  readonly onStay: () => void;
  readonly onLeave: () => void;
  readonly pending?: boolean;
  readonly errorMessage?: string;
  readonly bodyText?: string;
  readonly leaveLabel?: string;
}
