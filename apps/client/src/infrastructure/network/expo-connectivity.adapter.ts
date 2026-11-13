import * as Network from "expo-network";

import type {
  ConnectivityPort,
  ConnectivityState,
} from "@domain/services/connectivity.port";

function toReachability(state: Network.NetworkState): ConnectivityState {
  if (state.isConnected === false || state.isInternetReachable === false) {
    return false;
  }
  if (state.isInternetReachable === true || state.isConnected === true) {
    return true;
  }
  return null;
}

/** Expo Network adapter for web, Android, and iOS. */
export class ExpoConnectivityAdapter implements ConnectivityPort {
  async getIsOnline(): Promise<ConnectivityState> {
    try {
      return toReachability(await Network.getNetworkStateAsync());
    } catch {
      return null;
    }
  }

  subscribe(listener: (isOnline: ConnectivityState) => void): () => void {
    try {
      const subscription = Network.addNetworkStateListener((state) => {
        listener(toReachability(state));
      });
      return () => subscription.remove();
    } catch {
      return () => undefined;
    }
  }
}
