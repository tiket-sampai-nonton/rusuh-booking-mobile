import type { EventSummary } from "@domain/repositories/event.repository";
import { catalogQuarter } from "@domain/rules/catalog-quarter";

const DAY = 86_400_000;
const WIB_OFFSET = 7 * 60 * 60 * 1000;

/** Calendar bounds used by the mock catalog adapter. */
export function inTimeBucket(
  ev: Pick<EventSummary, "startsAt">,
  time: string,
  now: number,
): boolean {
  if (time === "all") return true;
  const t = ev.startsAt ? Date.parse(ev.startsAt) : Number.NaN;
  if (!Number.isFinite(t)) return false;
  const wibNow = new Date(now + WIB_OFFSET);
  const wibEvent = new Date(t + WIB_OFFSET);
  if (time === "week") {
    const start =
      Date.UTC(
        wibNow.getUTCFullYear(),
        wibNow.getUTCMonth(),
        wibNow.getUTCDate(),
      ) -
      ((wibNow.getUTCDay() + 6) % 7) * DAY;
    const eventDay = Date.UTC(
      wibEvent.getUTCFullYear(),
      wibEvent.getUTCMonth(),
      wibEvent.getUTCDate(),
    );
    return eventDay >= start && eventDay < start + 7 * DAY;
  }
  if (time === "month")
    return (
      wibNow.getUTCFullYear() === wibEvent.getUTCFullYear() &&
      wibNow.getUTCMonth() === wibEvent.getUTCMonth()
    );
  if (time === "quarter") {
    const day = wibEvent.toISOString().slice(0, 10);
    const range = catalogQuarter(now);
    return day >= range.startDate && day <= range.endDate;
  }
  return true;
}
