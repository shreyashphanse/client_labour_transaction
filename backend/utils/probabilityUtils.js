export const calculateSuccessProbability = ({
  clientScore,
  budgetCompatibility,
}) => {
  let probability = 50; // base probability

  // ✅ Client Reliability Impact
  probability += (clientScore - 50) * 0.5;

  // ✅ Budget Compatibility Impact
  if (budgetCompatibility === "good") probability += 20;
  if (budgetCompatibility === "negotiable") probability += 5;
  if (budgetCompatibility === "poor") probability -= 25;

  if (probability < 5) probability = 5;
  if (probability > 95) probability = 95;

  return Math.round(probability);
};
