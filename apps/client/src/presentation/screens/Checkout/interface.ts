/** Checkout screen prop + fragment types. */
import type { ReactNode } from "react";

import type { TicketRow } from "@domain/rules/checkout";

export interface CheckoutScreenProps {
  readonly sessionId: string;
}

export interface SectionProps {
  readonly title: string;
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
}

export interface CheckoutTopBarProps {
  readonly remainingMs: number;
  readonly warn: boolean;
  readonly expired: boolean;
  readonly onBack: () => void;
}

export interface CheckoutHeroProps {
  readonly eventId: string;
}

export interface TicketItemProps {
  readonly index: number;
  readonly row: TicketRow;
  readonly canRemove: boolean;
  readonly onRemove: () => void;
  readonly onPatch: (p: Partial<TicketRow>) => void;
  readonly onUseBuyer: (on: boolean) => void;
}

export interface CheckoutBarProps {
  readonly totalMinor: number;
  readonly ready: boolean;
  readonly pending: boolean;
  readonly expired: boolean;
  readonly errorMessage?: string;
  readonly onSubmit: () => void;
  readonly bottomInset: number;
}

export interface LeaveConfirmProps {
  readonly visible: boolean;
  readonly onStay: () => void;
  readonly onLeave: () => void;
}
