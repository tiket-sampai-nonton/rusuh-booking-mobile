/** Expired screen prop + copy types. */
export type ExpiredReason = "payment" | "payment-failed" | "session" | "booking" | string;

export interface ExpiredScreenProps {
  readonly resourceId: string;
  readonly reason?: ExpiredReason;
}

/** Reason-driven copy block (glyph, title, sub, info-card text, CTA label). */
export interface ExpiredCopy {
  readonly glyph: string;
  readonly title: string;
  readonly sub: string;
  readonly card: string;
  readonly cta: string;
}

export interface ExpiredActionsProps {
  readonly cta: string;
  readonly onRequeue: () => void;
  readonly onHome: () => void;
}
