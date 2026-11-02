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
  /** Booking total in minor IDR (carried from the hold to the payment page —
   *  the frozen ports expose no "get booking by id", so the amount rides here). */
  amountMinor?: number;
  /** Selected payment method bucket. */
  paymentMethod?: PaymentMethod;
  /** The created payment attempt id (SNAP handoff + verify reference). */
  attemptId?: string;
  /** MASKED buyer NIK for the success summary (never the raw NIK — D7.1/D7.5). */
  buyerNikMasked?: string;
  /** Number of tickets held (for the e-ticket list on success). */
  ticketCount?: number;

  /** Record the queue join. */
  setQueue: (eventId: string, queueId: string, status: QueueStatus) => void;
  /** Update the observed queue status. */
  setQueueStatus: (status: QueueStatus) => void;
  /** Record a created booking session. */
  setSession: (sessionId: string) => void;
  /** Record a confirmed booking (id + total). */
  setBooking: (bookingId: string, amountMinor?: number) => void;
  /** Record the order detail shown on success (masked NIK + ticket count). */
  setOrderDetail: (buyerNikMasked: string, ticketCount: number) => void;
  /** Record the chosen payment method + the created attempt id. */
  setPaymentMethod: (method: PaymentMethod, attemptId?: string) => void;
  /** Clear everything (terminal: success / expiry / cancel — D7.4). */
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  setQueue: (eventId, queueId, queueStatus) =>
    set({ eventId, queueId, queueStatus }),
  setQueueStatus: (queueStatus) => set({ queueStatus }),
  setSession: (sessionId) => set({ sessionId }),
  setBooking: (bookingId, amountMinor) => set({ bookingId, amountMinor }),
  setOrderDetail: (buyerNikMasked, ticketCount) =>
    set({ buyerNikMasked, ticketCount }),
  setPaymentMethod: (paymentMethod, attemptId) =>
    set({ paymentMethod, attemptId }),
  reset: () =>
    set({
      eventId: undefined,
      queueId: undefined,
      queueStatus: undefined,
      sessionId: undefined,
      bookingId: undefined,
      amountMinor: undefined,
      paymentMethod: undefined,
      attemptId: undefined,
      buyerNikMasked: undefined,
      ticketCount: undefined,
    }),
}));
