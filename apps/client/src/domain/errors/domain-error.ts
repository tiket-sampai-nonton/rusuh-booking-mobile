/**
 * Domain error taxonomy (RBT-013, D3.4/D3.5).
 *
 * Typed errors the rest of the app reasons about, decoupled from the transport.
 * Each carries a Bahasa `userMessage` (safe to surface in the UI) and the raw
 * `code` for logging. `RateLimitedError` additionally carries `retryAfterMs` so
 * callers honor backoff.
 *
 * Pure domain: no React / RN / Expo / infrastructure imports. The mapper
 * (`error-mapper.ts`) accepts a plain `{ code, retryAfterMs? }` shape rather
 * than importing the infrastructure `TransportError`, keeping the Dependency
 * Rule intact (domain never imports infrastructure).
 */

/** Discriminator for the domain error kinds. */
export type DomainErrorKind =
  | "validation"
  | "auth"
  | "rate_limited"
  | "quota"
  | "session_expired"
  | "sold_out"
  | "not_found"
  | "conflict"
  | "dependency"
  | "unknown";

export class DomainError extends Error {
  readonly kind: DomainErrorKind;
  readonly code: string;
  readonly userMessage: string;
  readonly retryAfterMs?: number;

  constructor(params: {
    kind: DomainErrorKind;
    code: string;
    userMessage: string;
    retryAfterMs?: number;
  }) {
    super(`${params.kind}:${params.code}`);
    this.name = "DomainError";
    this.kind = params.kind;
    this.code = params.code;
    this.userMessage = params.userMessage;
    this.retryAfterMs = params.retryAfterMs;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
