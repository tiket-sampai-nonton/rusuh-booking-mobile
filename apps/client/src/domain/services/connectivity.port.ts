/** Device/network reachability exposed without binding domain code to an OS SDK. */
export type ConnectivityState = boolean | null;

export interface ConnectivityPort {
  /** `null` means the operating system cannot determine reachability yet. */
  getIsOnline(): Promise<ConnectivityState>;
  subscribe(listener: (isOnline: ConnectivityState) => void): () => void;
}
