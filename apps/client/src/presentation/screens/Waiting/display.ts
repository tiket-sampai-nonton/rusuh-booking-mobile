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
    body: "Tiket Anda terjamin saat giliran tiba. Posisi Anda tidak akan didahului.",
  },
  POSSIBLE: {
    tone: "warn",
    icon: "warning",
    label: "Zona kemungkinan",
    body: "Peluang masuk bergantung pada sisa tiket.",
  },
  NOT_ENOUGH: {
    tone: "error",
    icon: "alert",
    label: "Peluang Terbatas",
    body: "Posisi Anda melewati perkiraan stok. Tetap mengantre, tiket mungkin tersedia jika ada pembatalan.",
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
    ? "Maaf, semua tiket event ini habis terjual saat Anda mengantre."
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
    return "Semua tiket habis saat giliran Anda. Jelajahi event lainnya.";
  }
  if (errorState === "UNKNOWN")
    return "Tidak dapat menyiapkan sesi. Periksa koneksi, lalu kembali ke event.";
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

  //  info text
  infoText:
    "Jangan tutup halaman ini. Posisi antrean diperbarui otomatis. Jangan muat ulang atau tinggalkan halaman agar posisi Anda tetap terjaga.",

  //  warning messages
  backgroundWarningTitle: "Halaman di Latar Belakang",
  backgroundWarningText:
    "Posisi antrean Anda tetap tersimpan. Biarkan halaman ini aktif agar perpindahan berjalan lancar saat giliran tiba.",
  longWaitWarningTitle: "Antrean Diperkirakan Lama",
  longWaitWarningText:
    "Waktu tunggu dapat berubah. Biarkan halaman ini terbuka; kami akan memberi tahu saat giliran Anda hampir tiba.",
  turnExpiryTitle: "Giliran Anda Berakhir Dalam",

  //  redirect countdown
  redirectTitle: "Giliran Anda!",
  redirectText: "Membuka halaman pemilihan tiket…",

  //  modal
  leaveModalTitle: "Keluar dari Antrean?",
  leaveModalText:
    "Jika Anda keluar sekarang, posisi antrean akan hilang dan Anda harus bergabung kembali dari belakang.",
  stayInQueue: "Tetap Mengantre",
  leaveQueue: "Keluar dari Antrean",

  //  error states
  soldOutTitle: "Tiket Habis",
  soldOutText: "Maaf, semua tiket event ini habis terjual saat Anda mengantre.",
  saleEndedTitle: "Penjualan Berakhir",
  saleEndedText: "Masa penjualan tiket event ini telah berakhir.",
  sessionExpiredTitle: "Sesi Kedaluwarsa",
  sessionExpiredText:
    "Sesi antrean Anda berakhir karena tidak aktif. Silakan bergabung kembali.",
  turnExpiredTitle: "Giliran Berakhir",
  turnExpiredText:
    "Anda belum memilih tiket tepat waktu. Giliran diberikan kepada orang berikutnya dalam antrean.",

  //  buttons
  browseEvents: "Jelajahi Event Lain",
  rejoinQueue: "Bergabung Kembali",

  //  network status
  connectionLost: "Koneksi terputus. Posisi antrean Anda tetap tersimpan…",
  reconnected: "Koneksi tersambung kembali. Memperbarui antrean…",
} as const;
