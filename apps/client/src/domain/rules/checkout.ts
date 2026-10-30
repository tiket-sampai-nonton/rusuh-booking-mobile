/**
 * Checkout domain rules — pure (framework-free).
 *
 * NIK validation (16 digits, D9.1), buyer email, ticket-quantity limits
 * (min 1, max maxSelectable ≤ 3 per buyer-NIK), single-use "buyer NIK as
 * attendee" rule, and the readiness check that gates the hold. The BE remains
 * authoritative (D2.4) — these improve UX and block an obviously-invalid hold.
 */

/** NIK mask: first 2 + last 2 visible, middle redacted (SECURITY — never log raw). */
export function maskNik(nik: string): string {
  if (nik.length < 4) return "****";
  return `${nik.slice(0, 2)}****${nik.slice(-2)}`;
}

/** A 16-digit NIK (digits only). */
export function isValidNik(nik: string): boolean {
  return /^\d{16}$/.test(nik);
}

/** A minimally-valid email (UX gate; BE is authoritative). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** One ticket row in the checkout form. */
export interface TicketRow {
  readonly categoryId: string;
  readonly attendeeName: string;
  readonly attendeeNik: string;
  /** This row uses the buyer's NIK as the attendee (single-use). */
  readonly useBuyerNik: boolean;
}

export const MAX_TICKETS = 3;

/** True when the row count is within [1, maxSelectable] (cap ≤ MAX_TICKETS). */
export function isQuantityValid(count: number, maxSelectable: number): boolean {
  const cap = Math.min(maxSelectable, MAX_TICKETS);
  return count >= 1 && count <= cap;
}

/** Effective cap for the session (never above MAX_TICKETS). */
export function effectiveCap(maxSelectable: number | undefined): number {
  return Math.min(maxSelectable ?? MAX_TICKETS, MAX_TICKETS);
}

/**
 * Resolve each row's effective attendee NIK: a `useBuyerNik` row takes the
 * buyer NIK, others their own. Returns the resolved NIK list (for duplicate
 * checks + the hold payload).
 */
export function resolveAttendeeNiks(
  rows: readonly TicketRow[],
  buyerNik: string,
): string[] {
  return rows.map((r) => (r.useBuyerNik ? buyerNik : r.attendeeNik));
}

/** True when at most ONE row claims the buyer NIK (single-use, D9.1). */
export function buyerNikUsedOnce(rows: readonly TicketRow[]): boolean {
  return rows.filter((r) => r.useBuyerNik).length <= 1;
}

/** True when no two tickets carry the same (resolved) attendee NIK. */
export function attendeeNiksUnique(
  rows: readonly TicketRow[],
  buyerNik: string,
): boolean {
  const niks = resolveAttendeeNiks(rows, buyerNik).filter((n) => n.length > 0);
  return new Set(niks).size === niks.length;
}

export interface CheckoutState {
  readonly buyerNik: string;
  readonly buyerEmail: string;
  readonly rows: readonly TicketRow[];
  readonly maxSelectable: number;
}

/** Overall readiness: valid buyer, valid quantity, every row complete + unique. */
export function isCheckoutReady(state: CheckoutState): boolean {
  if (!isValidNik(state.buyerNik)) return false;
  if (!isValidEmail(state.buyerEmail)) return false;
  if (!isQuantityValid(state.rows.length, state.maxSelectable)) return false;
  if (!buyerNikUsedOnce(state.rows)) return false;
  for (const r of state.rows) {
    if (r.categoryId.length === 0) return false;
    const nik = r.useBuyerNik ? state.buyerNik : r.attendeeNik;
    const name = r.useBuyerNik ? "buyer" : r.attendeeName;
    if (!isValidNik(nik)) return false;
    if (name.trim().length === 0) return false;
  }
  return attendeeNiksUnique(state.rows, state.buyerNik);
}
