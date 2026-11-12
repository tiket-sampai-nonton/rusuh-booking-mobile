/**
 * UserRepository — domain PORT (ARCHITECTURE §2.1, §3; RBT-010 NEW).
 *
 * Pure TS: no React / RN / Expo / browser / native / codegen imports.
 * Infrastructure implements this port (`HttpUserRepository`); the composition
 * root binds the concrete adapter.
 *
 * Covers the User service: passwordless OTP (request/verify) + profile. Sign-in
 * is OPTIONAL — a guest completes the whole flow without it (D8.5). Consumed by
 * the auth use cases (E3, RBT-020/021). NIK is stored encrypted BE-side; the FE
 * keeps only a masked NIK in the account profile. Checkout may request the
 * authenticated user's real email/NIK for prefill; that response is transient
 * screen state and must never be persisted or logged (SECURITY).
 */

/** Issued after a successful OTP verify. */
export interface AuthSession {
  readonly token: string;
  /** True when the account still needs name+NIK (registration not complete). */
  readonly isNew: boolean;
}

/** The signed-in user's profile (safe for the in-memory account store). */
export interface UserProfile {
  readonly emailMasked: string;
  readonly fullName?: string;
  readonly nikMasked?: string;
  /** Profile-complete indicator (FE-NEED O1 → maps GET /me.hasNik). */
  readonly hasNik: boolean;
}

/**
 * Checkout-only values returned by authenticated GET /me. The raw NIK is
 * intentionally separate from UserProfile so it cannot be placed in the
 * shared account store or persisted by existing session code.
 */
export interface CheckoutUserDetails {
  readonly email: string;
  readonly fullName?: string;
  readonly nik?: string;
}

export interface UserRepository {
  /** Send a 6-digit OTP to the email (anti-enumeration: same response always). */
  requestOtp(email: string): Promise<void>;
  /** Verify the OTP; returns the auth session (token + isNew). */
  verifyOtp(email: string, code: string): Promise<AuthSession>;
  /** Complete registration for a new account (name + NIK + consent). */
  completeRegistration(input: {
    fullName: string;
    nik: string;
  }): Promise<UserProfile>;
  /** Fetch the current profile (powers checkout auto-fill). */
  getMe(): Promise<UserProfile>;
  /** Fetch full email/NIK for checkout prefill; never persist this result. */
  getCheckoutDetails(): Promise<CheckoutUserDetails>;
  logout?(): Promise<void>;
}
