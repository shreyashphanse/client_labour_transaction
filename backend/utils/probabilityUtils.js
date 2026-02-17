export const calculateSuccessProbability = ({
  clientScore = 50,
  budgetCompatibility = "medium",
  stationOverlapStrength = 1,
  skillMatch = true,
}) => {
  let probability = 50;

  /* ✅ Client Reliability */
  probability += (clientScore - 50) * 0.4;

  /* ✅ Budget Compatibility */
  if (budgetCompatibility === "good") probability += 18;
  if (budgetCompatibility === "negotiable") probability += 6;
  if (budgetCompatibility === "poor") probability -= 22;
  if (budgetCompatibility === "unknown") probability += 0;

  /* ✅ Station Overlap */
  probability += stationOverlapStrength * 8;

  /* ✅ Skill Match */
  if (skillMatch) probability += 10;
  else probability -= 35;

  /* ✅ Clamp */
  if (probability < 5) probability = 5;
  if (probability > 95) probability = 95;

  return Math.round(probability);
};
