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
 * ETA text uses Bahasa labels: "Siap!" at the front, else ~N menit using a
 * fixed admission rate (the server rate isn't on the frozen QueueEntry, so the
 * prototype's default 1400/min is used as the display heuristic).
 */
const ADMISSION_RATE_PER_MIN = 1400;
export function etaText(position: number): string {
  if (position <= 0) return "Siap!";
  const mins = Math.max(1, Math.ceil(position / ADMISSION_RATE_PER_MIN));
  return mins <= 1 ? "~1 menit" : `~${mins} menit`;
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
    label: "Zona Aman",
    body: "Tiket Anda terjamin saat giliran tiba. Posisi Anda tidak akan didahului.",
  },
  POSSIBLE: {
    tone: "warn",
    icon: "warning",
    label: "Zona Cadangan",
    body: "Anda berada di zona cadangan. Ketersediaan tiket bergantung pada sisa stok.",
  },
  NOT_ENOUGH: {
    tone: "error",
    icon: "alert",
    label: "Peluang Terbatas",
    body: "Posisi Anda melewati perkiraan stok. Tetap mengantre, tiket mungkin tersedia jika ada pembatalan.",
  },
};

export function zoneCopy(zone: QueueZone | undefined): ZoneCopy {
  return ZONE_COPY[zone ?? "GUARANTEED"];
}

/** Terminal-state titles shown to the user. */
export function terminalTitle(status: QueueStatus): string {
  return status === "SOLD_OUT" ? "Tiket Habis" : "Penjualan Berakhir";
}

/** Terminal-state body copy (recovery hint). */
export function terminalBody(status: QueueStatus): string {
  return status === "SOLD_OUT"
    ? "Maaf, semua tiket event ini habis terjual saat Anda mengantre."
    : "Masa penjualan tiket event ini telah berakhir.";
}

/** Claim-error (RBT-044) title mirrors the terminal titles. */
export function claimErrorTitle(errorState: "TURN_MISSED" | "EVENT_SOLD_OUT" | "UNKNOWN"): string {
  return errorState === "EVENT_SOLD_OUT" ? "Tiket Habis" : "Giliran Berakhir";
}

/** Claim-error body copy. */
export function claimErrorBody(
  errorState: "TURN_MISSED" | "EVENT_SOLD_OUT" | "UNKNOWN",
): string {
  if (errorState === "EVENT_SOLD_OUT") {
    return "Semua tiket habis saat giliran Anda. Jelajahi event lainnya.";
  }
  return "Anda belum memilih tiket tepat waktu. Giliran diberikan kepada orang berikutnya dalam antrean.";
}

/** Verbatim copy constants reused across fragments. */
export const COPY = {
  eyebrow: "Ruang Tunggu Virtual",
  positionLabel: "Posisi Anda",
  title: "Anda sedang mengantre",
  persistenceSub:
    "Posisi Anda tersimpan dengan aman di server. Memuat ulang atau menutup halaman tidak akan menghapus antrean Anda.",
  aheadLabel: "Orang di depan Anda",
  etaLabel: "Perkiraan waktu tunggu",
  admitTitle: "Giliran Anda!",
  admitSub: "Menyiapkan halaman pemilihan tiket…",
  leave: "Keluar dari Antrean",
  noQueueTitle: "Tidak Ada Antrean Aktif",
  noQueueSub: "Anda belum bergabung ke antrean event mana pun.",
  errorTitle: "Antrean Gagal Dimuat",
  errorSub: "Terjadi kendala. Silakan coba lagi.",
  loadingSub: "Menghubungkan…",
  footnote:
    "Antrean dilayani sesuai urutan kedatangan. Token antrean diterbitkan dan divalidasi server. Pembaruan mengikuti jadwal dari server.",

  // V2 info text
  infoText:
    "Jangan tutup halaman ini. Posisi antrean diperbarui otomatis. Jangan muat ulang atau tinggalkan halaman agar posisi Anda tetap terjaga.",

  // V2 warning messages
  backgroundWarningTitle: "Halaman di Latar Belakang",
  backgroundWarningText:
    "Posisi antrean Anda tetap tersimpan. Biarkan halaman ini aktif agar perpindahan berjalan lancar saat giliran tiba.",
  longWaitWarningTitle: "Antrean Diperkirakan Lama",
  longWaitWarningText:
    "Perkiraan waktu tunggu lebih dari 10 menit. Biarkan halaman ini terbuka; kami akan memberi tahu saat giliran Anda hampir tiba.",
  turnExpiryTitle: "Giliran Anda Berakhir Dalam",

  // V2 redirect countdown
  redirectTitle: "Giliran Anda!",
  redirectText: "Membuka halaman pemilihan tiket…",

  // V2 modal
  leaveModalTitle: "Keluar dari Antrean?",
  leaveModalText:
    "Jika Anda keluar sekarang, posisi antrean akan hilang dan Anda harus bergabung kembali dari belakang.",
  stayInQueue: "Tetap Mengantre",
  leaveQueue: "Keluar dari Antrean",

  // V2 error states
  soldOutTitle: "Tiket Habis",
  soldOutText: "Maaf, semua tiket event ini habis terjual saat Anda mengantre.",
  saleEndedTitle: "Penjualan Berakhir",
  saleEndedText: "Masa penjualan tiket event ini telah berakhir.",
  sessionExpiredTitle: "Sesi Kedaluwarsa",
  sessionExpiredText: "Sesi antrean Anda berakhir karena tidak aktif. Silakan bergabung kembali.",
  turnExpiredTitle: "Giliran Berakhir",
  turnExpiredText: "Anda belum memilih tiket tepat waktu. Giliran diberikan kepada orang berikutnya dalam antrean.",

  // V2 buttons
  browseEvents: "Jelajahi Event Lain",
  rejoinQueue: "Bergabung Kembali",

  // V2 network status
  connectionLost: "Koneksi terputus. Posisi antrean Anda tetap tersimpan…",
  reconnected: "Koneksi tersambung kembali. Memperbarui antrean…",
} as const;
