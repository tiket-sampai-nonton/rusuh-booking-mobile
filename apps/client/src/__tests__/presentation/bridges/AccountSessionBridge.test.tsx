import { act, render, waitFor } from "@testing-library/react-native";

import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { AccountSessionBridge } from "@presentation/bridges/AccountSessionBridge";
import { useAccountStore } from "@presentation/stores/account-store";

function renderBridge(container: Container) {
  return render(
    <ServiceProvider container={container}>
      <AccountSessionBridge />
    </ServiceProvider>,
  );
}

describe("AccountSessionBridge lifecycle", () => {
  afterEach(() => useAccountStore.getState().clearProfile());

  it("does not request a profile when a session was already restored", async () => {
    const base = createContainer({ useMocks: true });
    const getMe = jest.fn();
    useAccountStore.getState().setProfile({
      emailMasked: "a***@example.test",
      fullName: "Penonton",
      hasNik: false,
    });
    renderBridge({
      ...base,
      tokenStorage: { ...base.tokenStorage, load: async () => "session-token" },
      userRepository: { ...base.userRepository, getMe },
    });

    await act(async () => Promise.resolve());
    expect(getMe).not.toHaveBeenCalled();
  });

  it("restores the saved buyer email with the authenticated profile", async () => {
    const base = createContainer({ useMocks: true });
    const container: Container = {
      ...base,
      buyerEmailStorage: {
        ...base.buyerEmailStorage,
        load: async () => "buyer@example.com",
      },
      tokenStorage: { ...base.tokenStorage, load: async () => "session-token" },
      userRepository: {
        ...base.userRepository,
        getMe: async () => ({
          emailMasked: "b***@example.com",
          fullName: "Buyer",
          hasNik: false,
        }),
      },
    };

    renderBridge(container);
    await waitFor(() =>
      expect(useAccountStore.getState().buyerEmail).toBe("buyer@example.com"),
    );
    expect(useAccountStore.getState().profile?.emailMasked).toBe(
      "b***@example.com",
    );
  });

  it("ignores a session result after the bridge unmounts", async () => {
    const base = createContainer({ useMocks: true });
    let resolveToken: (value: string | null) => void = () => undefined;
    let resolveProfile: (value: {
      emailMasked: string;
      fullName: string;
      hasNik: boolean;
    }) => void = () => undefined;
    const getMe = jest.fn(
      () =>
        new Promise<{ emailMasked: string; fullName: string; hasNik: boolean }>(
          (resolve) => {
            resolveProfile = resolve;
          },
        ),
    );
    const view = renderBridge({
      ...base,
      tokenStorage: {
        ...base.tokenStorage,
        load: () =>
          new Promise<string | null>((resolve) => {
            resolveToken = resolve;
          }),
      },
      userRepository: { ...base.userRepository, getMe },
    });

    await act(async () => resolveToken("session-token"));
    expect(resolveProfile).toBeDefined();
    view.unmount();
    await act(async () =>
      resolveProfile({
        emailMasked: "a***@example.test",
        fullName: "Penonton",
        hasNik: false,
      }),
    );
    expect(getMe).toHaveBeenCalledTimes(1);
    expect(useAccountStore.getState().profile).toBeUndefined();
  });
});
