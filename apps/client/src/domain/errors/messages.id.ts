/**
 * errorCode → Bahasa Indonesia message + domain-error kind (RBT-013).
 *
 * The single source of truth mapping every contract `errorCode` to (a) the
 * domain error kind and (b) a user-facing Bahasa message. Adding a new code =
 * one entry here (OCP). Pure data; no imports beyond the kind type.
 */
import type { DomainErrorKind } from "@domain/errors/domain-error";

export interface ErrorSpec {
  readonly kind: DomainErrorKind;
  readonly message: string;
}

/** Contract errorCode → spec. Covers all codes in .genesis/docs/api-contract. */
export const ERROR_SPECS: Readonly<Record<string, ErrorSpec>> = {
  VALIDATION_ERROR: { kind: "validation", message: "Data yang dimasukkan tidak valid. Periksa kembali." },
  NIK_INVALID: { kind: "validation", message: "NIK tidak valid. Pastikan 16 digit sesuai KTP." },
  UNAUTHORIZED: { kind: "auth", message: "Sesi Anda tidak sah. Silakan masuk kembali." },
  ACCOUNT_DISABLED: { kind: "auth", message: "Akun Anda dinonaktifkan. Hubungi dukungan." },
  OTP_INVALID: { kind: "auth", message: "Kode OTP salah atau kedaluwarsa. Coba lagi." },
  OTP_LOCKED: { kind: "auth", message: "Terlalu banyak percobaan OTP. Coba beberapa saat lagi." },
  OTP_RESEND_TOO_SOON: { kind: "rate_limited", message: "Mohon tunggu sebelum meminta OTP lagi." },
  RATE_LIMITED: { kind: "rate_limited", message: "Terlalu banyak permintaan. Coba lagi sebentar." },
  BUYER_QUOTA_EXHAUSTED: { kind: "quota", message: "Kuota tiket untuk NIK ini sudah habis." },
  QUANTITY_EXCEEDS_LIMIT: { kind: "quota", message: "Jumlah tiket melebihi batas yang diizinkan." },
  ATTENDEE_NIK_ALREADY_REGISTERED: { kind: "quota", message: "NIK peserta sudah terdaftar untuk acara ini." },
  NIK_ALREADY_IN_QUEUE: { kind: "conflict", message: "NIK ini sudah berada dalam antrean." },
  NIK_ALREADY_LINKED: { kind: "conflict", message: "NIK sudah tertaut ke akun lain." },
  CHECK_LIMIT_REACHED: { kind: "quota", message: "Batas pengecekan NIK tercapai." },
  SESSION_EXPIRED: { kind: "session_expired", message: "Sesi pemesanan telah berakhir. Mulai lagi dari awal." },
  SESSION_INVALID: { kind: "session_expired", message: "Sesi tidak valid. Mulai lagi dari awal." },
  ADMISSION_TOKEN_INVALID: { kind: "session_expired", message: "Token masuk tidak berlaku. Ulangi antrean." },
  BOOKING_LOCKED: { kind: "conflict", message: "Pemesanan sedang diproses. Mohon tunggu." },
  BOOKING_NOT_PAYABLE: { kind: "conflict", message: "Pemesanan ini tidak dapat dibayar." },
  TURN_MISSED: { kind: "session_expired", message: "Giliran Anda terlewat. Silakan antre kembali." },
  EVENT_SOLD_OUT: { kind: "sold_out", message: "Tiket acara ini telah habis terjual." },
  PAYMENT_METHOD_UNAVAILABLE: { kind: "conflict", message: "Metode pembayaran tidak tersedia saat ini." },
  PAYMENT_PAGE_TOKEN_INVALID: { kind: "session_expired", message: "Halaman pembayaran kedaluwarsa. Ulangi." },
  PAYMENT_PROVIDER_UNAVAILABLE: { kind: "dependency", message: "Layanan pembayaran sedang gangguan. Coba lagi." },
  PAYMENT_PROVIDER_ERROR: { kind: "dependency", message: "Terjadi kesalahan pada pembayaran. Coba lagi." },
  WEBHOOK_SIGNATURE_INVALID: { kind: "conflict", message: "Verifikasi pembayaran gagal." },
  DEPENDENCY_UNAVAILABLE: { kind: "dependency", message: "Layanan sedang tidak tersedia. Coba lagi nanti." },
  NOT_FOUND: { kind: "not_found", message: "Data yang diminta tidak ditemukan." },
};

/** Fallback used when a code is not in the table. */
export const UNKNOWN_SPEC: ErrorSpec = {
  kind: "unknown",
  message: "Terjadi kesalahan. Silakan coba lagi.",
};
