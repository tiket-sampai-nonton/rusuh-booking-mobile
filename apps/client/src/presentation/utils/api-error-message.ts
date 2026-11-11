import { DomainError } from "@domain/errors/domain-error";
import { ERROR_SPECS, UNKNOWN_SPEC } from "@domain/errors/messages.id";

const NETWORK_FAILURE_PATTERN =
  /cors|failed to fetch|fetch failed|network request failed|networkerror|load failed|err_network|connection reset|timed? ?out|offline|jaringan|koneksi/i;

interface ErrorDetails {
  readonly name?: unknown;
  readonly message?: unknown;
  readonly userMessage?: unknown;
  readonly code?: unknown;
  readonly httpStatus?: unknown;
  readonly status?: unknown;
}

/** Convert API failures to safe copy without exposing transport diagnostics. */
export function apiErrorMessage(
  error: unknown,
  fallback = UNKNOWN_SPEC.message,
): string {
  if (error instanceof DomainError) return error.userMessage;

  const details =
    typeof error === "object" && error !== null
      ? (error as ErrorDetails)
      : undefined;
  if (typeof details?.userMessage === "string") return details.userMessage;

  const message = typeof details?.message === "string" ? details.message : "";
  const code =
    typeof details?.code === "string"
      ? details.code
      : /^([A-Z][A-Z0-9_]+):/.exec(message)?.[1];
  if (code && ERROR_SPECS[code]) return ERROR_SPECS[code].message;

  if (details?.name === "TypeError" || NETWORK_FAILURE_PATTERN.test(message)) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.";
  }

  const status =
    typeof details?.httpStatus === "number"
      ? details.httpStatus
      : typeof details?.status === "number"
        ? details.status
        : undefined;
  if (status === 401 || status === 403)
    return "Akses sesi ini tidak diizinkan. Kembali dan coba lagi.";
  if (status === 404) return "Data tidak ditemukan atau sudah tidak tersedia.";
  if (status === 400 || status === 422)
    return "Permintaan tidak dapat diproses. Periksa informasi lalu coba lagi.";
  if (status === 409)
    return "Permintaan ini bertentangan dengan status terbaru. Muat ulang lalu coba lagi.";
  if (status === 408 || status === 429)
    return "Permintaan terlalu lama atau terlalu sering. Tunggu sebentar, lalu coba lagi.";
  if (status !== undefined && status >= 500)
    return "Layanan sedang mengalami gangguan. Coba lagi sebentar.";

  return fallback;
}
