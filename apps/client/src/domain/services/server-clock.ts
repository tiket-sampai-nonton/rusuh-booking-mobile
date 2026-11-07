/**
 * ServerClock — server-authoritative clock (RBT-011).
 *
 * Pure-domain service: depends ONLY on the `ClockPort` abstraction, never on
 * the device `Date` directly. Framework-free (no React / React Native / Expo /
 * browser / native imports) so it is deterministic in tests and portable.
 *
 * It keeps a single `offset` (serverTime − deviceTime at the last sync) and
 * layers it on top of the injected clock. Because the offset is anchored to a
 * server timestamp and only re-written by `sync`, a later device-clock change
 * (manual set, NTP correction, DST, app refresh) does NOT reset it — only an
 * explicit re-sync does.
 */
import type { ClockPort } from "@domain/services/clock.port";

export class ServerClock {
  /** serverTime − deviceTime captured at the last `sync`. Starts at 0 (unsynced). */
  private offset = 0;

  constructor(private readonly clock: ClockPort) {}

  /**
   * Anchor the clock to an authoritative server timestamp.
   * Stores `offset = serverTime − deviceTime(now)`; re-sync overwrites it.
   */
  sync(serverTimeIso: string): void {
    this.offset = Date.parse(serverTimeIso) - this.clock.now();
  }

  /** Current server-authoritative time in epoch milliseconds. */
  serverNow(): number {
    return this.clock.now() + this.offset;
  }

  /**
   * Milliseconds remaining until `expiresAtIso`, measured on the server clock.
   * Never negative — a past expiry returns 0.
   */
  remaining(expiresAtIso: string): number {
    return Math.max(0, Date.parse(expiresAtIso) - this.serverNow());
  }
}
