export const getBudgetCompatibility = (budget, expectedRate) => {
  if (!expectedRate) return "unknown";

  if (budget >= expectedRate) return "good";

  if (budget >= expectedRate * 0.7) return "negotiable";

  return "poor";
};
