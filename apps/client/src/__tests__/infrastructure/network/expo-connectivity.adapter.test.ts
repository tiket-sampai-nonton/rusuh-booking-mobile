import * as Network from "expo-network";

import { ExpoConnectivityAdapter } from "@infrastructure/network/expo-connectivity.adapter";

const mockedNetwork = Network as jest.Mocked<typeof Network>;

describe("ExpoConnectivityAdapter", () => {
  beforeEach(() => jest.clearAllMocks());

  it("reports offline when the device has no internet reachability", async () => {
    mockedNetwork.getNetworkStateAsync.mockResolvedValue({
      isConnected: true,
      isInternetReachable: false,
    });
    await expect(new ExpoConnectivityAdapter().getIsOnline()).resolves.toBe(
      false,
    );
  });

  it("keeps reachability unknown when the operating system has no result", async () => {
    mockedNetwork.getNetworkStateAsync.mockResolvedValue({
      isConnected: undefined,
      isInternetReachable: undefined,
    });
    await expect(new ExpoConnectivityAdapter().getIsOnline()).resolves.toBe(
      null,
    );
  });

  it("publishes native connectivity changes and disposes the listener", () => {
    let onNetworkState: ((state: Network.NetworkState) => void) | undefined;
    const remove = jest.fn();
    mockedNetwork.addNetworkStateListener.mockImplementation((listener) => {
      onNetworkState = listener;
      return { remove } as ReturnType<typeof Network.addNetworkStateListener>;
    });
    const listener = jest.fn();
    const unsubscribe = new ExpoConnectivityAdapter().subscribe(listener);

    onNetworkState?.({ isConnected: false });
    unsubscribe();

    expect(listener).toHaveBeenCalledWith(false);
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
