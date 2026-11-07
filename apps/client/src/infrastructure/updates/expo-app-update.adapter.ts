import { Platform } from "react-native";
import * as Updates from "expo-updates";

import type { AppUpdatePort } from "@domain/services/app-update.port";

/** Expo Updates adapter. Update lifecycle decisions stay in the application layer. */
export class ExpoAppUpdateAdapter implements AppUpdatePort {
  get isEnabled(): boolean {
    return Platform.OS !== "web" && Updates.isEnabled;
  }

  async checkForUpdate(): Promise<boolean> {
    const result = await Updates.checkForUpdateAsync();
    return result.isAvailable;
  }

  async downloadUpdate(): Promise<boolean> {
    const result = await Updates.fetchUpdateAsync();
    return result.isNew;
  }

  async reload(): Promise<void> {
    await Updates.reloadAsync();
  }
}
