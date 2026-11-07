/** Platform boundary for checking, downloading, and applying app updates. */
export interface AppUpdatePort {
  /** False when remote updates are unavailable (web, Expo Go, or development). */
  readonly isEnabled: boolean;
  checkForUpdate(): Promise<boolean>;
  downloadUpdate(): Promise<boolean>;
  reload(): Promise<void>;
}
