/** Clears app-owned persisted authentication and in-progress user journey data. */
export interface UserDataStorage {
  clear(): Promise<void>;
}
