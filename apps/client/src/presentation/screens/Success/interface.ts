/** Success screen prop + fragment types. */
export interface SuccessScreenProps {
  readonly bookingId: string;
}

export interface SuccessSummaryProps {
  readonly bookingId: string;
  readonly ticketCount: number;
  readonly amountMinor?: number;
  readonly buyerNikMasked?: string;
}

export interface SuccessSummaryRowProps {
  readonly label: string;
  readonly value: string;
}

export interface SuccessActionsProps {
  readonly onDownload: () => void;
  readonly onHome: () => void;
}

export interface SuccessUnverifiedProps {
  readonly onHome: () => void;
}
