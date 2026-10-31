/**
 * Account store (Zustand) — the OPTIONAL signed-in buyer identity.
 *
 * Login is optional in this product (a guest completes the whole flow — project
 * rule). The prototype's "Masuk / Daftar" modal captures email + name + NIK so
 * checkout can auto-fill the buyer box. This store holds that identity on the
 * client only; it is NOT auth state and carries no token. The raw NIK is kept
 * only to pre-fill the checkout field the user would type anyway (never logged,
 * never sent anywhere here — the BE validates on submit, D7.1/D7.5).
 *
 * Zustand lives in presentation/stores per ARCHITECTURE §2.2 / D4.
 */
import { create } from "zustand";

export interface Account {
  readonly email: string;
  readonly name: string;
  /** Raw 16-digit NIK, used only to pre-fill the checkout buyer field. */
  readonly nik: string;
}

export interface AccountState {
  account?: Account;
  /** Sign in / register — stores the captured buyer identity. */
  signIn: (account: Account) => void;
  /** Sign out — clears the identity. */
  signOut: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  signIn: (account) => set({ account }),
  signOut: () => set({ account: undefined }),
}));
