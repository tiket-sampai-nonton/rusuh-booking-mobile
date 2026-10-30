/**
 * Queue display rules — pure domain (framework-free).
 *
 * Maps a `QueueEntry` into the waiting-room view model (RBT-043): whether the
 * user is still waiting, admitted (→ auto-claim), or in a terminal/error state,
 * plus the "jangan PHP" zone copy. Also derives the adaptive poll interval that
 * the hook honours (RBT-042) and a coarse ETA.
 */
import type {
  QueueEntry,
  QueueStatus,
  QueueZone,
} from "@domain/repositories/queue.repository";

/** High-level phase the waiting-room screen renders. */
export type WaitingPhase = "waiting" | "admitted" | "terminal";

/** Zone copy — color + label + body (status never color-only, RBT-080). */
export interface ZoneCopy {
  readonly tone: "ok" | "warn" | "error";
  readonly label: string;
  readonly body: string;
}

/** Terminal/error statuses that end the waiting-room loop. */
const TERMINAL: ReadonlySet<QueueStatus> = new Set<QueueStatus>([
  "MISSED",
  "LEFT",
  "SOLD_OUT",
  "CLOSED",
  "COMPLETED",
  "ENDED",
]);

/** Phase for a status: WAITING→waiting, ADMITTED/CLAIMED→admitted, else terminal. */
export function phaseFor(status: QueueStatus): WaitingPhase {
  if (status === "WAITING") return "waiting";
  if (status === "ADMITTED" || status === "CLAIMED") return "admitted";
  return "terminal";
}

/** True when the status authorizes proceeding to checkout (FR-08). */
export function isAdmitted(status: QueueStatus): boolean {
  return status === "ADMITTED" || status === "CLAIMED";
}

/** True when the status is terminal (loop stops, show recovery). */
export function isTerminal(status: QueueStatus): boolean {
  return TERMINAL.has(status);
}

/** Bahasa message for a terminal status (recovery copy). */
export function terminalMessage(status: QueueStatus): string {
  switch (status) {
    case "SOLD_OUT":
      return "Tiket acara ini telah habis terjual.";
    case "MISSED":
      return "Giliran Anda terlewat. Silakan antre kembali.";
    case "CLOSED":
    case "ENDED":
      return "Antrean untuk acara ini telah berakhir.";
    case "LEFT":
      return "Anda telah keluar dari antrean.";
    case "COMPLETED":
      return "Antrean selesai.";
    default:
      return "Antrean berakhir.";
  }
}

/** Zone copy for the "jangan PHP" display (prototype waiting.html). */
export function zoneCopy(zone: QueueZone | undefined): ZoneCopy | null {
  switch (zone) {
    case "GUARANTEED":
      return {
        tone: "ok",
        label: "Zona Aman",
        body: "Begitu giliranmu tiba kamu dijamin masuk — tidak dipotong di tengah jalan.",
      };
    case "POSSIBLE":
      return {
        tone: "warn",
        label: "Masih Mungkin",
        body: "Posisimu di zona cadangan — peluang masuk tergantung sisa tiket.",
      };
    case "NOT_ENOUGH":
      return {
        tone: "error",
        label: "Belum Cukup Tiket",
        body: "Posisimu di luar perkiraan stok. Tetap tunggu — stok bisa kembali bila ada yang batal.",
      };
    default:
      return null;
  }
}

/**
 * Adaptive poll interval the hook honours. Uses the server hint
 * (`nextPollAfterMs`) when present, else a position-based fallback (far = slow,
 * near = fast), clamped to [1s, 15s] so there is no request storm (NFR-05/06).
 */
export function pollIntervalMs(entry: Pick<QueueEntry, "position" | "nextPollAfterMs">): number {
  const MIN = 1000;
  const MAX = 15_000;
  if (typeof entry.nextPollAfterMs === "number" && entry.nextPollAfterMs > 0) {
    return Math.min(MAX, Math.max(MIN, entry.nextPollAfterMs));
  }
  // Fallback: far in line polls slowly, near the front polls quickly.
  if (entry.position > 50) return 8000;
  if (entry.position > 10) return 4000;
  return 2000;
}

/** Coarse ETA text from position (≈3s per person ahead), Bahasa. */
export function etaText(position: number): string {
  if (position <= 0) return "Sekarang";
  const seconds = position * 3;
  if (seconds < 60) return `± ${seconds} detik`;
  const minutes = Math.ceil(seconds / 60);
  return `± ${minutes} menit`;
}
