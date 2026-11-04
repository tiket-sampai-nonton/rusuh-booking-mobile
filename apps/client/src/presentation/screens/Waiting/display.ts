/**
 * RBT-043 — pure waiting-room display helpers (no React / RN imports).
 *
 * The EXACT Bahasa copy and palette are lifted verbatim from the UX source of
 * truth `.genesis/prototype/Final/waiting.html`. Keeping them pure makes the
 * copy unit-testable and keeps the "status is never color-only" a11y invariant
 * (RBT-080) honest: every zone carries an icon + label + body, not just a hue.
 */
import type { QueueStatus, QueueZone } from "@domain/repositories/queue.repository";

/** id-ID grouped number, mirroring the prototype's `toLocaleString('id-ID')`. */
export function formatCount(n: number): string {
  const safe = Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
  return safe.toLocaleString("id-ID");
}

/** People ahead of you = position − 1 (never negative). */
export function peopleAhead(position: number): number {
  return Math.max(0, position - 1);
}

/**
 * ETA text, mirroring the V2 prototype: "Ready!" at the front, else ~N min using a
 * fixed admission rate (the server rate isn't on the frozen QueueEntry, so the
 * prototype's default 1400/min is used as the display heuristic).
 */
const ADMISSION_RATE_PER_MIN = 1400;
export function etaText(position: number): string {
  if (position <= 0) return "Ready!";
  const mins = Math.max(1, Math.ceil(position / ADMISSION_RATE_PER_MIN));
  return mins <= 1 ? "~1 min" : `~${mins} min`;
}

/**
 * ETA in minutes and seconds (for V2 time blocks).
 * Returns { minutes, seconds } based on position.
 */
export function etaMinutesSeconds(position: number): { minutes: number; seconds: number } {
  if (position <= 0) return { minutes: 0, seconds: 0 };
  const totalSeconds = Math.ceil((position / ADMISSION_RATE_PER_MIN) * 60);
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  };
}

/** Ring fill 0..1 — full at the front, emptier further back (monotonic). */
export function ringProgress(position: number): number {
  if (position <= 0) return 1;
  const p = 1 / (1 + position / 5);
  return Math.max(0, Math.min(1, p));
}

/** A zone's visual tone key (maps to the prototype's green / amber / red). */
export type ZoneTone = "ok" | "warn" | "error";

export interface ZoneCopy {
  readonly tone: ZoneTone;
  readonly icon: "lock" | "warning" | "alert";
  readonly label: string;
  readonly body: string;
}

/** EXACT zone copy from V2 prototype 06-waiting.html (English, icon + bold label + body). */
export const ZONE_COPY: Readonly<Record<QueueZone, ZoneCopy>> = {
  GUARANTEED: {
    tone: "ok",
    icon: "lock",
    label: "Safe Zone",
    body: "Your ticket is guaranteed when your turn arrives. You will not be cut in line.",
  },
  POSSIBLE: {
    tone: "warn",
    icon: "warning",
    label: "Possible Zone",
    body: "You are in the reserve zone. Ticket availability depends on remaining stock.",
  },
  NOT_ENOUGH: {
    tone: "error",
    icon: "alert",
    label: "Low Chance Zone",
    body: "Your position is beyond estimated stock. Stay in queue - tickets may become available if others cancel.",
  },
};

export function zoneCopy(zone: QueueZone | undefined): ZoneCopy {
  return ZONE_COPY[zone ?? "GUARANTEED"];
}

/** Terminal-state title per the V2 prototype (English). */
export function terminalTitle(status: QueueStatus): string {
  return status === "SOLD_OUT" ? "Sold Out" : "Sale Ended";
}

/** Terminal-state body copy (recovery hint). */
export function terminalBody(status: QueueStatus): string {
  return status === "SOLD_OUT"
    ? "Sorry, all tickets for this event have been sold while you were in the queue."
    : "The ticket sale period for this event has ended.";
}

/** Claim-error (RBT-044) title mirrors the terminal titles. */
export function claimErrorTitle(errorState: "TURN_MISSED" | "EVENT_SOLD_OUT" | "UNKNOWN"): string {
  return errorState === "EVENT_SOLD_OUT" ? "Sold Out" : "Turn Expired";
}

/** Claim-error body copy. */
export function claimErrorBody(
  errorState: "TURN_MISSED" | "EVENT_SOLD_OUT" | "UNKNOWN",
): string {
  if (errorState === "EVENT_SOLD_OUT") {
    return "All tickets sold out during your turn. Browse other events.";
  }
  return "You didn't proceed to ticket selection in time. Your turn has been given to the next person in queue.";
}

/** Verbatim copy constants reused across fragments. */
export const COPY = {
  // V2 prototype uses English labels
  eyebrow: "Virtual Waiting Room",
  positionLabel: "Your Position",
  title: "You're in the queue",
  persistenceSub:
    "Your position is safely stored on the server — refreshing or closing/reopening the tab won't remove you from the queue.",
  aheadLabel: "Ahead of you",
  etaLabel: "Estimated wait",
  admitTitle: "It's your turn!",
  admitSub: "Preparing ticket selection page...",
  leave: "Leave Queue",
  noQueueTitle: "No Active Queue",
  noQueueSub: "You haven't joined any event queue yet.",
  errorTitle: "Failed to Load Queue",
  errorSub: "Something went wrong. Please try again.",
  loadingSub: "Connecting...",
  footnote:
    "First-Come-First-Served queue. Queue tokens are issued & validated by the server. Adaptive polling follows nextPollAfterMs from server.",

  // V2 info text
  infoText:
    "Please keep this page open. Your position is automatically updated. Do not refresh or leave this page, or you will lose your spot.",

  // V2 warning messages
  backgroundWarningTitle: "Tab in Background",
  backgroundWarningText:
    "Your queue position is being held, but please keep this tab active to ensure smooth transition when it's your turn.",
  longWaitWarningTitle: "📱 Long Wait Expected",
  longWaitWarningText:
    "The estimated wait is over 10 minutes. Keep this tab open - we'll notify you when it's almost your turn.",
  turnExpiryTitle: "Your Turn Expires In",

  // V2 redirect countdown
  redirectTitle: "It's Your Turn!",
  redirectText: "Redirecting to ticket selection...",

  // V2 modal
  leaveModalTitle: "Leave Queue?",
  leaveModalText:
    "If you leave now, you will lose your position in the queue and will need to rejoin from the back.",
  stayInQueue: "Stay in Queue",
  leaveQueue: "Leave Queue",

  // V2 error states
  soldOutTitle: "Sold Out",
  soldOutText:
    "Sorry, all tickets for this event have been sold while you were in the queue.",
  saleEndedTitle: "Sale Ended",
  saleEndedText: "The ticket sale period for this event has ended.",
  sessionExpiredTitle: "⌛ Session Expired",
  sessionExpiredText:
    "Your queue session has expired due to inactivity. Please rejoin the queue.",
  turnExpiredTitle: "Turn Expired",
  turnExpiredText:
    "You didn't proceed to ticket selection in time. Your turn has been given to the next person in queue.",

  // V2 buttons
  browseEvents: "Browse Other Events",
  rejoinQueue: "Rejoin Queue",

  // V2 network status
  connectionLost: "Connection lost. Your position is being held...",
  reconnected: "Reconnected! Resuming queue...",
} as const;
