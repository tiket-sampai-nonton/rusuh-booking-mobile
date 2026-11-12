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

function detailsFrom(error: unknown): ErrorDetails | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  return error as ErrorDetails;
}

function errorCode(
  details: ErrorDetails | undefined,
  message: string,
): string | undefined {
  if (typeof details?.code === "string") return details.code;
  return /^([A-Z][A-Z0-9_]+):/.exec(message)?.[1];
}

function errorStatus(details: ErrorDetails | undefined): number | undefined {
  if (typeof details?.httpStatus === "number") return details.httpStatus;
  if (typeof details?.status === "number") return details.status;
  return undefined;
}

function statusMessage(status: number | undefined): string | undefined {
  switch (status) {
    case 401:
    case 403:
      return "Akses sesi ini tidak diizinkan. Kembali dan coba lagi.";
    case 404:
      return "Data tidak ditemukan atau sudah tidak tersedia.";
    case 400:
    case 422:
      return "Permintaan tidak dapat diproses. Periksa informasi lalu coba lagi.";
    case 409:
      return "Permintaan ini bertentangan dengan status terbaru. Muat ulang lalu coba lagi.";
    case 408:
    case 429:
      return "Permintaan terlalu lama atau terlalu sering. Tunggu sebentar, lalu coba lagi.";
    default:
      return status !== undefined && status >= 500
        ? "Layanan sedang mengalami gangguan. Coba lagi sebentar."
        : undefined;
  }
}

/** Convert API failures to safe copy without exposing transport diagnostics. */
export function apiErrorMessage(
  error: unknown,
  fallback = UNKNOWN_SPEC.message,
): string {
  if (error instanceof DomainError) return error.userMessage;

  const details = detailsFrom(error);
  if (typeof details?.userMessage === "string") return details.userMessage;

  const message = typeof details?.message === "string" ? details.message : "";
  const code = errorCode(details, message);
  if (code && ERROR_SPECS[code]) return ERROR_SPECS[code].message;

  if (details?.name === "TypeError" || NETWORK_FAILURE_PATTERN.test(message)) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.";
  }

  return statusMessage(errorStatus(details)) ?? fallback;
}
