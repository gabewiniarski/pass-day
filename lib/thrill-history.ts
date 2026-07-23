/**
 * Directional historical anchors published on Thrill Data's Universal Studios
 * Florida overview. This is intentionally a small, attributed calibration
 * layer—not a scraper or a substitute for a licensed historical export.
 *
 * Published anchors used here:
 * - 34 minute overall park average
 * - Saturday: 39 minutes
 * - Wednesday and Thursday: 32 minutes
 * - July: 41 minutes
 * - September: 26 minutes
 */

export const THRILL_DATA_URL =
  "https://www.thrill-data.com/waits/park/uor/universal-studios/";

const OVERALL_AVERAGE = 34;

const weekdayAverage = [34, 34, 34, 32, 32, 34, 39];

const monthAverage: Partial<Record<number, number>> = {
  6: 41,
  8: 26,
};

export type HistoricalWaitSignal = {
  expectedWait: number;
  differenceFromTypical: number;
  label: "Historically lighter" | "Near historical norms" | "Historically heavier";
  arrivalWindow: string;
  dayShape: [string, string, string];
};

export function getHistoricalWaitSignal(date: Date): HistoricalWaitSignal {
  const weekday = weekdayAverage[date.getDay()] ?? OVERALL_AVERAGE;
  const monthly = monthAverage[date.getMonth()] ?? OVERALL_AVERAGE;
  const expectedWait = Math.round((weekday + monthly) / 2);
  const differenceFromTypical = expectedWait - OVERALL_AVERAGE;
  const label =
    differenceFromTypical <= -3
      ? "Historically lighter"
      : differenceFromTypical >= 3
        ? "Historically heavier"
        : "Near historical norms";

  return {
    expectedWait,
    differenceFromTypical,
    label,
    arrivalWindow: "Opening hour",
    dayShape: ["Lightest", "Builds", "Eases"],
  };
}

export function historicalWaitToPressure(waitMinutes: number) {
  const normalized = 30 + ((waitMinutes - 26) / (41 - 26)) * 40;
  return Math.max(22, Math.min(82, Math.round(normalized)));
}

/**
 * Converts the published wait baseline into a recommendation component.
 * Unlike raw pressure, this is centered on a normal Universal day: a typical
 * wait can still be a worthwhile visit, while unusually light days earn the
 * highest scores.
 */
export function historicalWaitToOpportunity(waitMinutes: number) {
  const normalized = 100 - ((waitMinutes - 22) / (50 - 22)) * 55;
  return Math.max(38, Math.min(94, Math.round(normalized)));
}
