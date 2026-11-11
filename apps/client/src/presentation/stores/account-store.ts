/**
 * Account store (Zustand) — the OPTIONAL signed-in buyer profile (RBT-022, E3).
 *
 * Login is optional (D8.5): a guest completes the whole funnel without it. When
 * the user DOES sign in, this store holds their profile so checkout can
 * pre-fill the buyer box with a "Terisi dari akun" badge (AC1).
 *
 * SECURITY (SECURITY.md §3, D7.1): this store holds the masked profile the BE
 * returns and the signed-in email for checkout autofill. The email is persisted
 * separately through BuyerEmailStorage; the store itself remains in-memory. It
 * NEVER holds a raw NIK — a raw 16-digit NIK must never live in a
 * non-authoritative client store. No token lives here either.
 *
 * Zustand lives in presentation/stores per ARCHITECTURE §2.2 / D4. Framework
 * state only — no infrastructure import, no network.
 */
import { create } from "zustand";

import type { UserProfile } from "@domain/repositories/user.repository";

export interface AccountState {
  /** The signed-in user's MASKED profile, or undefined when guest. */
  profile?: UserProfile;
  /** Full login email, restored from BuyerEmailStorage for checkout autofill. */
  buyerEmail?: string;
  /** Store the masked profile after a successful sign-in / getMe. */
  setProfile: (profile: UserProfile, buyerEmail?: string) => void;
  setBuyerEmail: (email: string) => void;
  /** Clear on sign-out / terminal (D7.4). */
  clearProfile: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  setProfile: (profile, buyerEmail) =>
    set((current) => ({
      profile,
      buyerEmail: buyerEmail ?? current.buyerEmail,
    })),
  setBuyerEmail: (buyerEmail) => set({ buyerEmail }),
  clearProfile: () => set({ profile: undefined, buyerEmail: undefined }),
}));

/**
 * Checkout auto-fill source (AC1). Returns the masked buyer fields to pre-fill
 * the checkout buyer box plus `fromAccount` so the UI can show the
 * "Terisi dari akun" badge. Returns `fromAccount: false` for a guest.
 */
export interface CheckoutPrefill {
  readonly fromAccount: boolean;
  readonly fullName?: string;
  readonly email?: string;
  readonly emailMasked?: string;
  readonly nikMasked?: string;
}

/**
 * Derive the prefill from a profile directly. Callers that read the store
 * should select the STABLE `profile` reference and pass it here inside a
 * `useMemo` — selecting a freshly-built object from the store each render makes
 * zustand re-render on every tick (its default equality is `Object.is`).
 */
export function prefillFromProfile(
  p: UserProfile | undefined,
  buyerEmail?: string,
): CheckoutPrefill {
  if (!p) return { fromAccount: false };
  return {
    fromAccount: true,
    fullName: p.fullName,
    email: buyerEmail,
    emailMasked: p.emailMasked,
    nikMasked: p.nikMasked,
  };
}

export function selectCheckoutPrefill(state: AccountState): CheckoutPrefill {
  return prefillFromProfile(state.profile, state.buyerEmail);
}
