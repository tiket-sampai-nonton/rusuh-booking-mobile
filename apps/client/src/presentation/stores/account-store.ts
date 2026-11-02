/**
 * Account store (Zustand) — the OPTIONAL signed-in buyer profile (RBT-022, E3).
 *
 * Login is optional (D8.5): a guest completes the whole funnel without it. When
 * the user DOES sign in, this store holds their profile so checkout can
 * pre-fill the buyer box with a "Terisi dari akun" badge (AC1).
 *
 * SECURITY (SECURITY.md §3, D7.1): this store holds ONLY the MASKED profile the
 * BE returns (`emailMasked` / `fullName` / `nikMasked` / `hasNik`). It NEVER
 * holds a raw NIK — a raw 16-digit NIK must never live in a non-authoritative
 * client store. The checkout field is pre-filled from `nikMasked` for display;
 * the user re-enters / the BE validates the real NIK on submit. No token lives
 * here either (that is session state, RBT-023).
 *
 * Zustand lives in presentation/stores per ARCHITECTURE §2.2 / D4. Framework
 * state only — no infrastructure import, no network.
 */
import { create } from "zustand";

import type { UserProfile } from "@domain/repositories/user.repository";

export interface AccountState {
  /** The signed-in user's MASKED profile, or undefined when guest. */
  profile?: UserProfile;
  /** Store the masked profile after a successful sign-in / getMe. */
  setProfile: (profile: UserProfile) => void;
  /** Clear on sign-out / terminal (D7.4). */
  clearProfile: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: undefined }),
}));

/**
 * Checkout auto-fill source (AC1). Returns the masked buyer fields to pre-fill
 * the checkout buyer box plus `fromAccount` so the UI can show the
 * "Terisi dari akun" badge. Returns `fromAccount: false` for a guest.
 */
export interface CheckoutPrefill {
  readonly fromAccount: boolean;
  readonly fullName?: string;
  readonly emailMasked?: string;
  readonly nikMasked?: string;
}

export function selectCheckoutPrefill(state: AccountState): CheckoutPrefill {
  const p = state.profile;
  if (!p) return { fromAccount: false };
  return {
    fromAccount: true,
    fullName: p.fullName,
    emailMasked: p.emailMasked,
    nikMasked: p.nikMasked,
  };
}
