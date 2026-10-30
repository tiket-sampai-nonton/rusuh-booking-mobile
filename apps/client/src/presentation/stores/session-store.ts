/**
 * Session store (Zustand) — the funnel's cross-screen handoff state.
 *
 * Carries the identifiers that travel Home → Waiting → Checkout → Payment →
 * Success: the active queue entry, booking session, booking, and selected
 * payment method. This is CLIENT UI state (non-authoritative, D2.4/D7.2): the
 * BE remains the source of truth; the store only remembers "where am I" so a
 * screen can resume after navigation. No secrets / no raw NIK are stored here.
 *
 * Zustand lives in `presentation/stores` per ARCHITECTURE §2.2 / D4.
 */
import { create } from "zustand";

import type { PaymentMethod } from "@domain/repositories/payment.repository";
import type { QueueStatus } from "@domain/repositories/queue.repository";

export interface SessionState {
  /** Active event the user is transacting against. */
  eventId?: string;
  /** Issued queue entry id (waiting room). */
  queueId?: string;
  /** Latest observed queue status. */
  queueStatus?: QueueStatus;
  /** Booking session id (checkout). */
  sessionId?: string;
  /** Confirmed booking id (payment). */
  bookingId?: string;
  /** Selected payment method bucket. */
  paymentMethod?: PaymentMethod;

  /** Record the queue join. */
  setQueue: (eventId: string, queueId: string, status: QueueStatus) => void;
  /** Update the observed queue status. */
  setQueueStatus: (status: QueueStatus) => void;
  /** Record a created booking session. */
  setSession: (sessionId: string) => void;
  /** Record a confirmed booking. */
  setBooking: (bookingId: string) => void;
  /** Record the chosen payment method. */
  setPaymentMethod: (method: PaymentMethod) => void;
  /** Clear everything (terminal: success / expiry / cancel — D7.4). */
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  setQueue: (eventId, queueId, queueStatus) =>
    set({ eventId, queueId, queueStatus }),
  setQueueStatus: (queueStatus) => set({ queueStatus }),
  setSession: (sessionId) => set({ sessionId }),
  setBooking: (bookingId) => set({ bookingId }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  reset: () =>
    set({
      eventId: undefined,
      queueId: undefined,
      queueStatus: undefined,
      sessionId: undefined,
      bookingId: undefined,
      paymentMethod: undefined,
    }),
}));
