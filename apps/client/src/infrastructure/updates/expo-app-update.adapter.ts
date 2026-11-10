import { Platform } from "react-native";
import Constants from "expo-constants";

import type { AppUpdatePort } from "@domain/services/app-update.port";

type ExpoUpdates = typeof import("expo-updates");

/** Expo Updates adapter. Update lifecycle decisions stay in the application layer. */
export class ExpoAppUpdateAdapter implements AppUpdatePort {
  // Keep the native SDK lazy: Expo Go does not include the ExpoUpdates native
  // module, so a static import crashes before the app can decide updates are
  // unavailable in that runtime.
  private get api(): ExpoUpdates {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-updates") as ExpoUpdates;
  }

  get isEnabled(): boolean {
    if (
      Platform.OS === "web" ||
      Constants.appOwnership === "expo" ||
      Constants.executionEnvironment === "storeClient" ||
      Constants.expoVersion !== null
    ) {
      return false;
    }
    try {
      return this.api.isEnabled;
    } catch {
      return false;
    }
  }

  getBuildLabel(): string {
    const buildInfo = Constants.expoConfig?.extra?.buildInfo as
      | { environment?: string; otaRevision?: string }
      | undefined;
    const prefix = buildInfo?.environment === "production" ? "PROD" : "PREPROD";
    const appVersion = Constants.expoConfig?.version ?? "0.0.0";
    let embedded = true;
    try {
      if (this.isEnabled) embedded = this.api.isEmbeddedLaunch;
    } catch {
      // Expo Go and older binaries show the embedded .000 revision.
    }
    const rawRevision = embedded ? "0" : (buildInfo?.otaRevision ?? "0");
    const revision = /^\d+$/.test(rawRevision) ? rawRevision : "0";
    return `${prefix} ${appVersion}.${revision.padStart(3, "0")}`;
  }

  async checkForUpdate(): Promise<boolean> {
    if (!this.isEnabled) return false;
    try {
      const result = await this.api.checkForUpdateAsync();
      return result.isAvailable;
    } catch {
      return false;
    }
  }

  async downloadUpdate(): Promise<boolean> {
    if (!this.isEnabled) return false;
    try {
      const result = await this.api.fetchUpdateAsync();
      return result.isNew;
    } catch {
      return false;
    }
  }

  async reload(): Promise<void> {
    if (!this.isEnabled) return;
    try {
      await this.api.reloadAsync();
    } catch {
      // An unavailable OTA runtime must not prevent ordinary app startup.
    }
  }
}
