import {
  selectCheckoutPrefill,
  useAccountStore,
  type AccountState,
} from "@presentation/stores/account-store";
import type { UserProfile } from "@domain/repositories/user.repository";

const PROFILE: UserProfile = {
  emailMasked: "r***@gmail.com",
  fullName: "Rizky R.",
  nikMasked: "3171********1234",
  hasNik: true,
};

describe("presentation/account-store", () => {
  beforeEach(() => {
    useAccountStore.setState({ profile: undefined });
  });

  it("starts as a guest (no profile)", () => {
    expect(useAccountStore.getState().profile).toBeUndefined();
  });

  it("setProfile stores the masked profile; clearProfile removes it", () => {
    useAccountStore.getState().setProfile(PROFILE);
    expect(useAccountStore.getState().profile).toEqual(PROFILE);
    useAccountStore.getState().clearProfile();
    expect(useAccountStore.getState().profile).toBeUndefined();
  });

  it("holds ONLY masked fields — never a raw nik key (SECURITY §3)", () => {
    useAccountStore.getState().setProfile(PROFILE);
    const p = useAccountStore.getState().profile!;
    expect(p).not.toHaveProperty("nik");
    expect(p.nikMasked).toMatch(/\*/); // masked, contains asterisks
  });
});

describe("selectCheckoutPrefill", () => {
  it("returns fromAccount:false for a guest", () => {
    const state: AccountState = {
      profile: undefined,
      setProfile: () => {},
      clearProfile: () => {},
    };
    expect(selectCheckoutPrefill(state)).toEqual({ fromAccount: false });
  });

  it("returns masked buyer fields + fromAccount:true when signed in", () => {
    const state: AccountState = {
      profile: PROFILE,
      setProfile: () => {},
      clearProfile: () => {},
    };
    const prefill = selectCheckoutPrefill(state);
    expect(prefill).toEqual({
      fromAccount: true,
      fullName: "Rizky R.",
      emailMasked: "r***@gmail.com",
      nikMasked: "3171********1234",
    });
    // never leaks a raw nik
    expect(prefill).not.toHaveProperty("nik");
  });

  it("drives the store→selector path end to end", () => {
    useAccountStore.getState().setProfile(PROFILE);
    const prefill = selectCheckoutPrefill(useAccountStore.getState());
    expect(prefill.fromAccount).toBe(true);
    expect(prefill.nikMasked).toBe("3171********1234");
  });
});
