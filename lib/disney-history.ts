/**
 * Magic Kingdom all-time crowd anchors published by Queue-Times. These are a
 * transparent directional baseline, not a replacement for Disney operations
 * data or a paid forecast product.
 */

export const DISNEY_HISTORY_URL = "https://queue-times.com/parks/6/stats";

const TYPICAL_CROWD = 53;
const weekdayCrowd = [45, 60, 52, 57, 49, 49, 58];
const monthCrowd = [56, 65, 68, 59, 47, 54, 54, 45, 28, 46, 53, 58];

export function getDisneyCrowdSignal(date: Date) {
  const expectedCrowd = Math.round(
    ((weekdayCrowd[date.getDay()] ?? TYPICAL_CROWD) +
      (monthCrowd[date.getMonth()] ?? TYPICAL_CROWD)) /
      2,
  );
  const differenceFromTypical = expectedCrowd - TYPICAL_CROWD;
  const label =
    differenceFromTypical <= -5
      ? "Historically lighter"
      : differenceFromTypical >= 5
        ? "Historically heavier"
        : "Near historical norms";

  return {
    expectedCrowd,
    differenceFromTypical,
    label,
    arrivalWindow: "Opening hour",
    dayShape: ["Lightest", "Builds", "Eases"] as [string, string, string],
  };
}

export function disneyCrowdToOpportunity(crowdPressure: number) {
  return Math.max(35, Math.min(96, Math.round(94 - (crowdPressure - 20) * 0.72)));
}
