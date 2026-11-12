import { useEffect } from "react";

import { PrepareStartupUpdate } from "@application/app-update/prepare-startup-update.use-case";
import { useServices } from "@providers/service-context";

const STARTUP_UPDATE_TIMEOUT_MS = 10_000;

interface StartupUpdateBridgeProps {
  readonly onComplete: () => void;
  readonly onStatusChange: (status: string) => void;
  readonly onBuildLabelChange: (label: string) => void;
}

/** Holds the branded launch screen while checking/downloading, then applies an OTA. */
export function StartupUpdateBridge({
  onComplete,
  onStatusChange,
  onBuildLabelChange,
}: StartupUpdateBridgeProps) {
  const { appUpdate } = useServices();

  useEffect(() => {
    let finished = false;
    const complete = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      onComplete();
    };

    const timeout = setTimeout(complete, STARTUP_UPDATE_TIMEOUT_MS);
    const prepareUpdate = new PrepareStartupUpdate(appUpdate);
    onBuildLabelChange(appUpdate.getBuildLabel());

    void (async () => {
      try {
        if (!appUpdate.isEnabled) {
          complete();
          return;
        }

        onStatusChange("Memeriksa pembaruan");
        const downloaded = await prepareUpdate.execute(() =>
          onStatusChange("Mengunduh pembaruan"),
        );

        // A timed-out request may finish later. Do not surprise the user by
        // restarting the app after they have already entered the current build.
        if (finished) return;
        if (downloaded) {
          await appUpdate.reload();
          return;
        }
      } catch {
        // Offline, server, or download errors are non-fatal: continue with the
        // embedded/cached bundle and try again at the next startup.
      }

      complete();
    })();

    return () => {
      finished = true;
      clearTimeout(timeout);
    };
  }, [appUpdate, onBuildLabelChange, onComplete, onStatusChange]);

  return null;
}
