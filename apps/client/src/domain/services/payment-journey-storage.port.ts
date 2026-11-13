/** Stores only the booking reference needed to reconcile an interrupted payment journey. */
export interface PaymentJourneyStorage {
  load(): Promise<string | null>;
  save(bookingId: string): Promise<void>;
  clear(): Promise<void>;
}
