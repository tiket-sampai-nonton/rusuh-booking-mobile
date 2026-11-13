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

/** Normalize a typed NIK to the digits accepted by the booking contract. */
export function normalizeNikInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 16);
}

/** A minimally-valid email (UX gate; BE is authoritative). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** One ticket row in the checkout form. */
export interface TicketRow {
  /**
   * Stable identity for React list reconciliation. Rows are add/remove-able,
   * so the list MUST key on this (not the array index) — keying on the index
   * remounts the wrong row's input state when a middle row is removed. Minted
   * once by `emptyRow()` and preserved verbatim through every row transform.
   */
  readonly rowId: string;
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

/* ------------------------------------------------------------------ *
 * Pure row-list transforms (the add/remove/patch/single-use rules).
 * The screen holds `rows` in state and delegates every mutation here, so
 * the cap (≤ effectiveCap), the min-1 floor, and the single-use buyer-NIK
 * rule live in the domain and are unit-tested — not as inline screen guards.
 * ------------------------------------------------------------------ */

/** Append `newRow` when under the cap; otherwise return `rows` unchanged. */
export function appendRow(
  rows: readonly TicketRow[],
  newRow: TicketRow,
  cap: number,
): TicketRow[] {
  if (rows.length >= cap) return [...rows];
  return [...rows, newRow];
}

/** Remove row `index`, never dropping below the 1-row minimum. */
export function removeRowAt(
  rows: readonly TicketRow[],
  index: number,
): TicketRow[] {
  if (rows.length <= 1) return [...rows];
  return rows.filter((_, i) => i !== index);
}

/** Shallow-merge `patch` into row `index`; other rows untouched. */
export function patchRowAt(
  rows: readonly TicketRow[],
  index: number,
  patch: Partial<TicketRow>,
): TicketRow[] {
  return rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
}

/**
 * Set `useBuyerNik` on row `index`. Single-use: turning it ON clears it on
 * every other row; turning it OFF leaves the others as they were.
 */
export function setBuyerUseAt(
  rows: readonly TicketRow[],
  index: number,
  on: boolean,
): TicketRow[] {
  if (on && !canUseBuyerDataForTicket(index)) return [...rows];
  return rows.map((row, i) => {
    let useBuyerNik = row.useBuyerNik;
    if (i === index) useBuyerNik = on;
    else if (on || i !== 0) useBuyerNik = false;

    return { ...row, useBuyerNik };
  });
}

/* ------------------------------------------------------------------ *
 * Attendee-check interpretation (RBT-052 AC2).
 * ALREADY_REGISTERED blocks the hold; CHECK_LIMIT_REACHED only warns
 * (the user ran out of availability checks, not out of quota).
 * ------------------------------------------------------------------ */
export type AttendeeCheckResult =
  | "AVAILABLE"
  | "ALREADY_REGISTERED"
  | "CHECK_LIMIT_REACHED";

/** True when a check result must stop the order (ALREADY_REGISTERED). */
export function isAttendeeBlocked(result: AttendeeCheckResult): boolean {
  return result === "ALREADY_REGISTERED";
}

/** True when a check result is advisory only (CHECK_LIMIT_REACHED). */
export function isAttendeeWarning(result: AttendeeCheckResult): boolean {
  return result === "CHECK_LIMIT_REACHED";
}

export interface CheckoutState {
  readonly buyerNik: string;
  readonly buyerEmail: string;
  readonly buyerName?: string;
  /** Omit only for callers that do not expose an email confirmation field. */
  readonly emailConfirmation?: string;
  readonly rows: readonly TicketRow[];
  readonly maxSelectable: number;
  /**
   * Optional attendee-check verdicts keyed by resolved NIK (RBT-052). A NIK
   * mapped to ALREADY_REGISTERED blocks readiness; absent/AVAILABLE/limit do
   * not. Consent (RBT-052 AC3) is gated by `consentGiven`.
   */
  readonly attendeeChecks?: Readonly<Record<string, AttendeeCheckResult>>;
  /**
   * Whether the NIK/data-processing consent has been given. Logged-in users
   * consented at registration (pass true); guests must tick the inline gate.
   */
  readonly consentGiven?: boolean;
}

export type CheckoutIssue =
  | "required"
  | "invalid"
  | "mismatch"
  | "duplicate"
  | "already-registered";

export interface CheckoutRowIssues {
  readonly category?: "required";
  readonly attendeeName?: "required";
  readonly attendeeNik?: CheckoutIssue;
}

export interface CheckoutIssues {
  readonly buyerName?: "required";
  readonly buyerNik?: "required" | "invalid";
  readonly buyerEmail?: "required" | "invalid";
  readonly emailConfirmation?: "required" | "mismatch";
  readonly consent?: "required";
  readonly quantity?: "invalid";
  readonly buyerDataPosition?: "invalid";
  readonly rows: Readonly<Record<string, CheckoutRowIssues>>;
  readonly isValid: boolean;
}

/** Buyer identity is a single order-wide choice and belongs to ticket one. */
export function canUseBuyerDataForTicket(index: number): boolean {
  return index === 0;
}

/** Resolve the buyer-as-attendee choice for display and submission. */
export function resolveBuyerTicketRows(
  rows: readonly TicketRow[],
  buyerName: string,
  buyerNik: string,
): TicketRow[] {
  return rows.map((row) =>
    row.useBuyerNik
      ? { ...row, attendeeName: buyerName, attendeeNik: buyerNik }
      : row,
  );
}

/** Sum category priceMinor values for the selected rows. */
export function checkoutTotalMinor(
  rows: readonly TicketRow[],
  categories: readonly {
    readonly categoryId: string;
    readonly priceMinor: number;
  }[],
): number {
  const priceByCategory = new Map(
    categories.map((category) => [category.categoryId, category.priceMinor]),
  );
  return rows.reduce(
    (total, row) => total + (priceByCategory.get(row.categoryId) ?? 0),
    0,
  );
}

/** Apply the first available category only to rows that have no selection. */
export function assignDefaultCategory(
  rows: readonly TicketRow[],
  categoryId: string,
): TicketRow[] {
  let changed = false;
  const next = rows.map((row) => {
    if (row.categoryId) return row;
    changed = true;
    return { ...row, categoryId };
  });
  return changed ? next : [...rows];
}

/** The first backend-provided category is the initial checkout selection. */
export function defaultCheckoutCategory(
  categories: readonly {
    readonly categoryId: string;
    readonly available?: number;
  }[],
): string {
  return (
    categories.find(
      (category) => category.available === undefined || category.available > 0,
    )?.categoryId ?? ""
  );
}

/** Clear a selection when the server reports that its category is sold out. */
export function reconcileCheckoutCategories(
  rows: readonly TicketRow[],
  categories: readonly {
    readonly categoryId: string;
    readonly available?: number;
  }[],
): TicketRow[] {
  const valid = new Set(
    categories
      .filter(
        (category) =>
          category.available === undefined || category.available > 0,
      )
      .map((category) => category.categoryId),
  );
  const fallback = defaultCheckoutCategory(categories);
  return rows.map((row) =>
    valid.has(row.categoryId)
      ? row
      : { ...row, categoryId: row.categoryId ? "" : fallback },
  );
}

function nikIssue(nik: string): "required" | "invalid" | undefined {
  if (!nik.trim()) return "required";
  return isValidNik(nik) ? undefined : "invalid";
}

/** Validate checkout rules once; presentation maps issue codes to UI copy. */
export function validateCheckout(state: CheckoutState): CheckoutIssues {
  const buyerNikIssue = nikIssue(state.buyerNik);
  const buyerEmailIssue: "required" | "invalid" | undefined =
    !state.buyerEmail.trim()
      ? "required"
      : isValidEmail(state.buyerEmail)
        ? undefined
        : "invalid";
  const emailConfirmationIssue: "required" | "mismatch" | undefined =
    state.emailConfirmation === undefined
      ? undefined
      : !state.emailConfirmation.trim()
        ? "required"
        : state.emailConfirmation.trim() === state.buyerEmail.trim()
          ? undefined
          : "mismatch";
  const buyerDataRow = state.rows.find((row) => row.useBuyerNik);
  const resolvedBuyerName = state.buyerName ?? buyerDataRow?.attendeeName ?? "";
  const buyerNameIssue: "required" | undefined = state.rows.some(
    (row) => row.useBuyerNik,
  )
    ? resolvedBuyerName.trim()
      ? undefined
      : "required"
    : undefined;
  const consentIssue: "required" | undefined =
    state.consentGiven === false ? "required" : undefined;
  const quantityIssue: "invalid" | undefined = isQuantityValid(
    state.rows.length,
    state.maxSelectable,
  )
    ? undefined
    : "invalid";
  const buyerDataPositionIssue: "invalid" | undefined =
    state.rows.filter((row) => row.useBuyerNik).length > 1 ||
    state.rows.some(
      (row, index) => row.useBuyerNik && !canUseBuyerDataForTicket(index),
    )
      ? "invalid"
      : undefined;

  const resolvedNiks = resolveAttendeeNiks(state.rows, state.buyerNik);
  const nikCounts = new Map<string, number>();
  for (const nik of resolvedNiks) {
    if (nik) nikCounts.set(nik, (nikCounts.get(nik) ?? 0) + 1);
  }

  const rowIssues: Record<string, CheckoutRowIssues> = {};
  state.rows.forEach((row, index) => {
    const nik = resolvedNiks[index] ?? "";
    const currentNikIssue = nikIssue(nik);
    const duplicate = Boolean(nik) && (nikCounts.get(nik) ?? 0) > 1;
    const check = state.attendeeChecks?.[nik] ?? "AVAILABLE";
    const attendeeName = row.useBuyerNik ? resolvedBuyerName : row.attendeeName;
    rowIssues[row.rowId] = {
      ...(!row.categoryId ? { category: "required" as const } : {}),
      ...(!attendeeName.trim() ? { attendeeName: "required" as const } : {}),
      ...(currentNikIssue
        ? { attendeeNik: currentNikIssue }
        : duplicate
          ? { attendeeNik: "duplicate" as const }
          : isAttendeeBlocked(check)
            ? { attendeeNik: "already-registered" as const }
            : {}),
    };
  });

  const fieldIssues = {
    ...(buyerNameIssue ? { buyerName: buyerNameIssue } : {}),
    ...(buyerNikIssue ? { buyerNik: buyerNikIssue } : {}),
    ...(buyerEmailIssue ? { buyerEmail: buyerEmailIssue } : {}),
    ...(emailConfirmationIssue
      ? { emailConfirmation: emailConfirmationIssue }
      : {}),
    ...(consentIssue ? { consent: consentIssue } : {}),
    ...(quantityIssue ? { quantity: quantityIssue } : {}),
    ...(buyerDataPositionIssue
      ? { buyerDataPosition: buyerDataPositionIssue }
      : {}),
  };
  return {
    ...fieldIssues,
    rows: rowIssues,
    isValid:
      Object.keys(fieldIssues).length === 0 &&
      Object.values(rowIssues).every(
        (issues) => Object.keys(issues).length === 0,
      ),
  };
}

/** Overall readiness: valid buyer, valid quantity, every row complete + unique. */
export function isCheckoutReady(state: CheckoutState): boolean {
  return validateCheckout(state).isValid;
}
