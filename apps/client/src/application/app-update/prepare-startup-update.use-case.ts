import type { AppUpdatePort } from "@domain/services/app-update.port";

/** Check at startup and download a compatible update, leaving application/reload to the caller. */
export class PrepareStartupUpdate {
  constructor(private readonly appUpdate: AppUpdatePort) {}

  async execute(onDownloadStart?: () => void): Promise<boolean> {
    if (!this.appUpdate.isEnabled) return false;

    const isAvailable = await this.appUpdate.checkForUpdate();
    if (!isAvailable) return false;

    onDownloadStart?.();
    return this.appUpdate.downloadUpdate();
  }
}
