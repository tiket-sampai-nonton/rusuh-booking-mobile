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
 * ETA text, mirroring the prototype: "Siap!" at the front, else ~N mnt using a
 * fixed admission rate (the server rate isn't on the frozen QueueEntry, so the
 * prototype's default 1400/min is used as the display heuristic).
 */
const ADMISSION_RATE_PER_MIN = 1400;
export function etaText(position: number): string {
  if (position <= 0) return "Siap!";
  const mins = Math.max(1, Math.ceil(position / ADMISSION_RATE_PER_MIN));
  return mins <= 1 ? "~1 mnt" : `~${mins} mnt`;
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
  readonly icon: string;
  readonly label: string;
  readonly body: string;
}

/** EXACT zone copy from waiting.html (icon + bold label + body). */
export const ZONE_COPY: Readonly<Record<QueueZone, ZoneCopy>> = {
  GUARANTEED: {
    tone: "ok",
    icon: "🔒",
    label: "Zona Aman.",
    body: "Begitu giliranmu tiba kamu dijamin masuk — tidak akan dipotong di tengah jalan.",
  },
  POSSIBLE: {
    tone: "warn",
    icon: "⚠️",
    label: "Masih mungkin.",
    body: "Posisimu di zona cadangan — peluang masuk tergantung sisa tiket.",
  },
  NOT_ENOUGH: {
    tone: "error",
    icon: "🔴",
    label: "Belum cukup tiket.",
    body: "Posisimu di luar perkiraan stok. Tetap tunggu — stok bisa kembali bila ada yang batal.",
  },
};

export function zoneCopy(zone: QueueZone | undefined): ZoneCopy {
  return ZONE_COPY[zone ?? "GUARANTEED"];
}

/** Terminal-state title per the prototype: sold-out vs ended. */
export function terminalTitle(status: QueueStatus): string {
  return status === "SOLD_OUT" ? "Tiket habis" : "Antrean berakhir";
}

/** Terminal-state body copy (recovery hint). */
export function terminalBody(status: QueueStatus): string {
  return status === "SOLD_OUT"
    ? "Tiket habis. Cari event lain."
    : "Antrean berakhir. Masuk antrean lagi dari halaman event.";
}

/** Claim-error (RBT-044) title mirrors the terminal titles. */
export function claimErrorTitle(errorState: "TURN_MISSED" | "EVENT_SOLD_OUT" | "UNKNOWN"): string {
  return errorState === "EVENT_SOLD_OUT" ? "Tiket habis" : "Antrean berakhir";
}

/** Claim-error body copy. */
export function claimErrorBody(
  errorState: "TURN_MISSED" | "EVENT_SOLD_OUT" | "UNKNOWN",
): string {
  if (errorState === "EVENT_SOLD_OUT") return "Tiket habis saat giliranmu. Cari event lain.";
  return "Giliranmu terlewat. Masuk antrean lagi dari halaman event.";
}

/** Verbatim copy constants reused across fragments. */
export const COPY = {
  eyebrow: "Virtual Waiting Room",
  positionLabel: "Posisimu",
  title: "Kamu sedang mengantre",
  persistenceSub:
    "Posisimu tersimpan aman di server — refresh atau tutup-buka tab tidak akan menghapus antreanmu.",
  aheadLabel: "Di depanmu",
  etaLabel: "Estimasi",
  admitTitle: "Giliranmu tiba!",
  admitSub: "Menyiapkan halaman tiket untukmu…",
  leave: "Keluar dari antrean",
  noQueueTitle: "Belum ada antrean aktif",
  noQueueSub: "Kamu belum masuk antrean event mana pun.",
  errorTitle: "Gagal memuat antrean",
  errorSub: "Terjadi kesalahan. Coba lagi.",
  loadingSub: "Menyambungkan…",
  footnote:
    "Antrean First-Come-First-Served. Token antrean diterbitkan & divalidasi server. Polling adaptif mengikuti nextPollAfterMs dari server.",
} as const;
