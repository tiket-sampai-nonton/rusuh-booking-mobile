/**
 * TokenStorage — domain PORT (ARCHITECTURE §2.1 DIP, §3; RBT-023, E3 Auth).
 *
 * Pure TS interface: no React / RN / Expo / browser / native imports. Abstracts
 * WHERE the auth session token is persisted so the session lifecycle use cases
 * (persist / restore / clear) are storage-agnostic and deterministic in tests.
 * The composition root binds a concrete adapter: secure storage on native
 * (expo-secure-store), a non-persistent in-memory fallback on web/tests.
 *
 * SECURITY: the token is sensitive. Adapters MUST NOT log the raw token and
 * MUST store it only through secure storage on native (SECURITY.md). The web
 * fallback is in-memory only (SecureStore is native-only) — the token does not
 * survive a page reload on web; that tradeoff is documented on the adapters.
 */
export interface TokenStorage {
  /** Persist the auth session token (overwrites any existing value). */
  save(token: string): Promise<void>;
  /** The persisted token, or null if none is stored. */
  load(): Promise<string | null>;
  /** Remove the persisted token (sign-out). Idempotent when already empty. */
  clear(): Promise<void>;
}
