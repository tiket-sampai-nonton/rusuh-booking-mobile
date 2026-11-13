/** Inclusive WIB dates for the next three calendar months, starting today. */
export function catalogQuarter(serverNow: number): {
  startDate: string;
  endDate: string;
} {
  const wib = new Date(serverNow + 7 * 60 * 60 * 1000);
  const year = wib.getUTCFullYear();
  const month = wib.getUTCMonth();
  const day = wib.getUTCDate();
  const targetMonth = month + 3;
  const lastDay = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();
  const format = (date: Date) => date.toISOString().slice(0, 10);
  return {
    startDate: format(new Date(Date.UTC(year, month, day))),
    endDate: format(
      new Date(Date.UTC(year, targetMonth, Math.min(day, lastDay))),
    ),
  };
}
