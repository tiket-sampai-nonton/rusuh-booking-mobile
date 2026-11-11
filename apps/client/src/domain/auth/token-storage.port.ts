/**
 * TokenStorage — domain PORT (ARCHITECTURE §2.1 DIP, §3; RBT-023, E3 Auth).
 *
 * Pure TS interface: no React / RN / Expo / browser / native imports. Abstracts
 * WHERE the auth session token is persisted so the session lifecycle use cases
 * (persist / restore / clear) are storage-agnostic and deterministic in tests.
 * The composition root binds a concrete adapter: secure storage on native
 * (expo-secure-store), localStorage for real web sessions, and memory for
 * mocks/tests.
 *
 * SECURITY: the token is sensitive. Adapters MUST NOT log the raw token and
 * MUST store it only through secure storage on native (SECURITY.md). The web
 * adapter may persist it in localStorage and must never log the raw value.
 */
export interface TokenStorage {
  /** Persist the auth session token (overwrites any existing value). */
  save(token: string): Promise<void>;
  /** The persisted token, or null if none is stored. */
  load(): Promise<string | null>;
  /** Remove the persisted token (sign-out). Idempotent when already empty. */
  clear(): Promise<void>;
}
