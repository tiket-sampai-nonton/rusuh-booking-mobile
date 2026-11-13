import type { NavigationHistory } from "@domain/services/navigation-history.port";

/** Browser history has already moved when React Navigation rejects a reset. */
export class PlatformNavigationHistory implements NavigationHistory {
  constructor(private readonly isWeb: boolean) {}

  captureRestorePoint(path: string): () => void {
    if (
      !this.isWeb ||
      typeof globalThis.history === "undefined" ||
      typeof globalThis.location === "undefined"
    ) {
      return () => undefined;
    }

    const history = globalThis.history;
    const state = history.state as unknown;
    const current = new URL(globalThis.location.href);
    const url =
      current.pathname === path ? current.href : new URL(path, current).href;

    return () => {
      try {
        if (globalThis.location.href !== url) history.pushState(state, "", url);
      } catch {
        // The leave confirmation still protects the active booking.
      }
    };
  }
}
