/**
 * Envelope unwrap — infrastructure/api (ARCHITECTURE §3, §4.3; RBT-010 AC2).
 *
 * The BE wraps every response in `{ meta, data }` (SRS §3.1.4). A success
 * envelope carries the payload in `data`; an error envelope carries `data:null`
 * and a `meta.code`/`meta.message`. This module centralizes that unwrap so no
 * repository re-implements it (DRY + SRP).
 *
 * Pure TS: no React / React Native / Expo / axios / fetch. It operates on the
 * already-fetched `HttpResponse` the `HttpClient` port returned.
 *
 * The error-code → Bahasa mapping and Retry-After/backoff policy are NOT here —
 * they are RBT-013. This module only surfaces a typed `TransportError` carrying
 * the raw `meta` so RBT-013 can map it. Keeping that boundary is deliberate.
 */

import type { HttpResponse } from "@infrastructure/http/http-client";

/** The `meta` block every envelope carries (contract: Meta schema). */
export interface EnvelopeMeta {
  readonly code: number;
  readonly message?: string;
}

/** Success envelope: `data` holds the typed payload. */
export interface SuccessEnvelope<T> {
  readonly meta: EnvelopeMeta;
  readonly data: T;
}

/** Error envelope: `data` is null, `meta` carries the error code. */
export interface ErrorEnvelope {
  readonly meta: EnvelopeMeta;
  readonly data: null;
}

/**
 * Typed transport error thrown when the BE returns an error envelope or a
 * non-2xx status. Carries the raw `code`/`message`/`httpStatus` plus an
 * optional `retryAfterMs` parsed from the `Retry-After` header, so RBT-013 can
 * map `code` → a domain error + Bahasa message and honor backoff. It is NOT a
 * domain error itself — it is the infrastructure-level signal RBT-013 consumes.
 */
export class TransportError extends Error {
  readonly code: number;
  readonly httpStatus: number;
  readonly retryAfterMs?: number;

  constructor(params: {
    code: number;
    message?: string;
    httpStatus: number;
    retryAfterMs?: number;
  }) {
    super(params.message ?? `Transport error (code ${params.code})`);
    this.name = "TransportError";
    this.code = params.code;
    this.httpStatus = params.httpStatus;
    this.retryAfterMs = params.retryAfterMs;
    // Restore prototype chain (TS target < ES6 class extends Error quirk).
    Object.setPrototypeOf(this, TransportError.prototype);
  }
}

/** True when the body looks like an envelope (`meta` object present). */
function hasMeta(body: unknown): body is { meta: EnvelopeMeta; data: unknown } {
  return (
    typeof body === "object" &&
    body !== null &&
    "meta" in body &&
    typeof (body as { meta: unknown }).meta === "object" &&
    (body as { meta: unknown }).meta !== null
  );
}

/** Parse a `Retry-After` header (seconds, per RFC 7231) into ms, if present. */
export function parseRetryAfterMs(
  headers: Readonly<Record<string, string>>,
): number | undefined {
  const raw = headers["retry-after"] ?? headers["Retry-After"];
  if (raw === undefined) return undefined;
  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  return undefined;
}

/**
 * Assert a 2xx response for an endpoint whose success body carries no payload
 * (e.g. DELETE). Throws a `TransportError` on a non-2xx status or an error
 * envelope, but does NOT require `data` to be non-null.
 */
export function assertOk(response: HttpResponse<unknown>): void {
  const { status, headers, data: body } = response;
  const ok = status >= 200 && status < 300;
  if (ok) return;
  const retryAfterMs = parseRetryAfterMs(headers);
  const code = hasMeta(body) ? body.meta.code : status;
  const message = hasMeta(body) ? body.meta.message : `HTTP ${status}`;
  throw new TransportError({ code, message, httpStatus: status, retryAfterMs });
}

/**
 * Unwrap a `{meta,data}` response to its `data` payload, or throw a
 * `TransportError`. Throws when: HTTP status is non-2xx, the body is not a
 * recognizable envelope, or `data` is null (error envelope).
 */
export function unwrap<T>(response: HttpResponse<unknown>): T {
  const { status, headers, data: body } = response;
  const retryAfterMs = parseRetryAfterMs(headers);

  const ok = status >= 200 && status < 300;

  if (!hasMeta(body)) {
    // Not an envelope at all — surface the HTTP status as the code.
    if (ok) {
      throw new TransportError({
        code: status,
        message: "Malformed response: missing meta envelope",
        httpStatus: status,
        retryAfterMs,
      });
    }
    throw new TransportError({
      code: status,
      message: `HTTP ${status}`,
      httpStatus: status,
      retryAfterMs,
    });
  }

  const envelope = body as { meta: EnvelopeMeta; data: unknown };

  if (!ok || envelope.data === null) {
    throw new TransportError({
      code: envelope.meta.code,
      message: envelope.meta.message,
      httpStatus: status,
      retryAfterMs,
    });
  }

  return envelope.data as T;
}
