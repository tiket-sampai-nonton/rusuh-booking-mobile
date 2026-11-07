/**
 * RBT-043 — pure waiting-room display helpers (no React / RN imports).
 *
 * The EXACT Bahasa copy and palette are lifted verbatim from the UX source of
 * truth `.genesis/prototype/Final/waiting.html`. Keeping them pure makes the
 * copy unit-testable and keeps the "status is never color-only" a11y invariant
 * (RBT-080) honest: every zone carries an icon + label + body, not just a hue.
 */
import type {
  QueueStatus,
  QueueZone,
} from "@domain/repositories/queue.repository";

/** id-ID grouped number, mirroring the prototype's `toLocaleString('id-ID')`. */
export function formatCount(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const safe = Math.max(0, Math.trunc(n));
  return safe.toLocaleString("id-ID");
}

/** People ahead of you = position − 1 (never negative). */
export function peopleAhead(position: number): number {
  return Math.max(0, position - 1);
}

/** Estimate copy only when the server supplies its configured throughput. */
export function etaText(
  position: number,
  admissionRatePerMin?: number,
): string {
  if (!Number.isFinite(position)) return "Belum tersedia";
  if (position <= 0) return "Siap!";
  if (!isValidAdmissionRate(admissionRatePerMin)) return "Belum tersedia";
  const mins = Math.max(1, Math.ceil(position / admissionRatePerMin));
  return mins <= 1 ? "~1 mnt" : `~${mins} mnt`;
}

/**
 * ETA in minutes and seconds (for  time blocks).
 * Returns no estimate if the server has not supplied a valid admission rate.
 */
export function etaMinutesSeconds(
  position: number,
  admissionRatePerMin?: number,
): { minutes: number; seconds: number } | undefined {
  if (!Number.isFinite(position)) return undefined;
  if (position <= 0) return { minutes: 0, seconds: 0 };
  if (!isValidAdmissionRate(admissionRatePerMin)) return undefined;
  const totalSeconds = Math.ceil((position / admissionRatePerMin) * 60);
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  };
}

function isValidAdmissionRate(rate: number | undefined): rate is number {
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0;
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

/** EXACT zone copy from  prototype 06-waiting.html (English, icon + bold label + body). */
export const ZONE_COPY: Readonly<Record<QueueZone, ZoneCopy>> = {
  GUARANTEED: {
    tone: "ok",
    icon: "lock",
    label: "Zona Aman",
    body: "Tiketmu tetap tersedia sampai giliranmu tiba.",
  },
  POSSIBLE: {
    tone: "warn",
    icon: "warning",
    label: "Zona kemungkinan",
    body: "Kesempatan masuk bergantung pada sisa tiket.",
  },
  NOT_ENOUGH: {
    tone: "error",
    icon: "alert",
    label: "Peluang Terbatas",
    body: "Posisimu sudah melewati perkiraan jumlah tiket. Tetap di antrean; tiket bisa tersedia lagi jika ada pembatalan.",
  },
};

export function zoneCopy(zone: QueueZone | undefined): ZoneCopy {
  return zone
    ? ZONE_COPY[zone]
    : {
        tone: "warn",
        icon: "warning",
        label: "Status tiket belum tersedia",
        body: "Ketersediaan akan diperbarui saat informasi antrean tersedia.",
      };
}

/** Terminal-state titles shown to the user. */
export function terminalTitle(status: QueueStatus): string {
  return status === "SOLD_OUT" ? "Tiket Habis" : "Penjualan Berakhir";
}

/** Terminal-state body copy (recovery hint). */
export function terminalBody(status: QueueStatus): string {
  return status === "SOLD_OUT"
    ? "Maaf, tiket untuk acara ini habis saat kamu mengantre."
    : "Masa penjualan tiket event ini telah berakhir.";
}

/** Claim-error (RBT-044) title mirrors the terminal titles. */
export function claimErrorTitle(
  errorState: "TURN_MISSED" | "EVENT_SOLD_OUT" | "UNKNOWN",
): string {
  if (errorState === "EVENT_SOLD_OUT") return "Tiket Habis";
  if (errorState === "UNKNOWN") return "Gagal menghubungkan";
  return "Giliran Berakhir";
}

/** Claim-error body copy. */
export function claimErrorBody(
  errorState: "TURN_MISSED" | "EVENT_SOLD_OUT" | "UNKNOWN",
): string {
  if (errorState === "EVENT_SOLD_OUT") {
    return "Maaf, tiketnya habis saat giliranmu tiba. Coba lihat acara lainnya.";
  }
  if (errorState === "UNKNOWN")
    return "Kami belum bisa menyiapkan sesi tiket. Periksa koneksi, lalu coba lagi.";
  return "Waktu untuk memilih tiket sudah habis. Kamu bisa bergabung lagi dari awal.";
}

/** Verbatim copy constants reused across fragments. */
export const COPY = {
  eyebrow: "Antrean Tiket",
  positionLabel: "Posisimu",
  title: "Kamu sedang mengantre",
  persistenceSub:
    "Posisimu tersimpan. Kalau halaman tertutup, buka lagi tautan antrean ini untuk melanjutkan.",
  aheadLabel: "Orang di depanmu",
  etaLabel: "Perkiraan waktu",
  admitTitle: "Giliranmu tiba!",
  admitSub: "Menyiapkan pilihan tiket…",
  leave: "Keluar dari Antrean",
  noQueueTitle: "Belum ada antrean",
  noQueueSub: "Kamu belum bergabung ke antrean acara ini.",
  errorTitle: "Antrean belum bisa dibuka",
  errorSub: "Ada kendala saat memuat antrean. Coba lagi sebentar.",
  loadingSub: "Memuat antrean…",
  footnote:
    "Antrean berjalan sesuai urutan bergabung. Posisi diperbarui otomatis.",

  //  info text
  infoText:
    "Tetap di halaman ini. Kami akan memperbarui posisi antrean secara otomatis.",

  //  warning messages
  backgroundWarningTitle: "Kamu sedang di halaman lain",
  backgroundWarningText:
    "Posisimu tetap tersimpan. Kembali ke halaman antrean supaya tidak melewatkan giliran.",
  longWaitWarningTitle: "Antrean masih panjang",
  longWaitWarningText:
    "Waktu tunggu bisa berubah. Kami akan memperbarui perkiraannya di sini.",
  turnExpiryTitle: "Waktu giliranmu tersisa",

  //  redirect countdown
  redirectTitle: "Giliranmu tiba!",
  redirectText: "Membuka pilihan tiket…",

  //  modal
  leaveModalTitle: "Keluar dari antrean?",
  leaveModalText:
    "Kalau keluar sekarang, posisimu akan hilang dan kamu harus mengantre lagi dari awal.",
  stayInQueue: "Tetap di antrean",
  leaveQueue: "Keluar dari antrean",

  //  error states
  soldOutTitle: "Tiket Habis",
  soldOutText: "Maaf, tiketnya habis saat kamu mengantre.",
  saleEndedTitle: "Penjualan tiket selesai",
  saleEndedText: "Masa penjualan tiket acara ini sudah berakhir.",
  sessionExpiredTitle: "Sesi antrean berakhir",
  sessionExpiredText:
    "Sesi antreanmu berakhir. Kamu bisa bergabung lagi dari halaman acara.",
  turnExpiredTitle: "Waktu giliran habis",
  turnExpiredText:
    "Waktu untuk memilih tiket sudah habis. Kamu bisa bergabung lagi dari awal.",

  //  buttons
  browseEvents: "Lihat acara lain",
  rejoinQueue: "Antre lagi",

  //  network status
  connectionLost: "Koneksi terputus. Posisimu tetap tersimpan…",
  reconnected: "Koneksi tersambung lagi. Memperbarui antrean…",
} as const;
