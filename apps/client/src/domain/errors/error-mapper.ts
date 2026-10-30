/**
 * Error mapper + read-dedup (RBT-013, D3.4/D3.5).
 *
 * `mapError` turns a transport-level failure into a typed `DomainError` with a
 * Bahasa message. It accepts a PLAIN `{ code, retryAfterMs? }` shape — NOT the
 * infrastructure `TransportError` — so the domain layer never imports
 * infrastructure (Dependency Rule). The infrastructure/presentation seam adapts
 * its `TransportError` into this shape before calling.
 *
 * `dedupeReads` collapses identical concurrent read requests (same key) onto a
 * single in-flight promise, so a burst of pollers does not fan out duplicate
 * calls (D3.5 "reads deduped").
 */
import { DomainError } from "@domain/errors/domain-error";
import { ERROR_SPECS, UNKNOWN_SPEC } from "@domain/errors/messages.id";

/** Minimal transport-failure shape the mapper understands (domain-owned). */
export interface TransportFailure {
  readonly code: string;
  readonly retryAfterMs?: number;
}

/** Map a transport failure to a typed domain error with a Bahasa message. */
export function mapError(failure: TransportFailure): DomainError {
  const spec = ERROR_SPECS[failure.code] ?? UNKNOWN_SPEC;
  return new DomainError({
    kind: spec.kind,
    code: failure.code,
    userMessage: spec.message,
    // Backoff only meaningful for rate-limited failures.
    retryAfterMs:
      spec.kind === "rate_limited" ? failure.retryAfterMs : undefined,
  });
}

/**
 * Collapse identical concurrent reads. Given a key and a factory producing the
 * read promise, returns the SAME in-flight promise for concurrent callers with
 * the same key; once it settles the entry is cleared so the next read is fresh.
 */
export function createReadDeduper(): <T>(
  key: string,
  factory: () => Promise<T>,
) => Promise<T> {
  const inFlight = new Map<string, Promise<unknown>>();
  return <T>(key: string, factory: () => Promise<T>): Promise<T> => {
    const existing = inFlight.get(key);
    if (existing !== undefined) return existing as Promise<T>;
    const p = factory().finally(() => inFlight.delete(key));
    inFlight.set(key, p);
    return p;
  };
}
