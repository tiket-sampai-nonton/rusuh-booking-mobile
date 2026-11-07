/**
 * SystemClock — real adapter for `ClockPort` over the host wall clock.
 *
 * Framework-free (uses the ECMAScript `Date`, available on native and web, not
 * a browser/native-only global). Bound in BOTH mock and real modes: the clock
 * is a platform primitive, not a backend capability. `ServerClock` (RBT-011)
 * layers the server offset on top of this.
 */
import type { ClockPort } from "@domain/services/clock.port";

export class SystemClock implements ClockPort {
  now(): number {
    return Date.now();
  }
}
