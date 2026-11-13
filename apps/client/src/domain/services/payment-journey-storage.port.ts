/** Minimal, non-PII reference needed to reconcile an interrupted payment. */
export interface PaymentJourneyReference {
  readonly bookingId: string;
  /** Public event identifier used to restore event details on the success page. */
  readonly eventId?: string;
}

export interface PaymentJourneyStorage {
  load(): Promise<PaymentJourneyReference | null>;
  save(reference: PaymentJourneyReference): Promise<void>;
  clear(): Promise<void>;
}
