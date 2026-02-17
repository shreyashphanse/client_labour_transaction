export const calculateReliabilityScore = (stats) => {
  let score = 50; // ✅ Neutral baseline

  score += (stats.completedJobs || 0) * 5;
  score -= (stats.cancelledJobs || 0) * 10;
  score += (stats.verifiedPayments || 0) * 8;

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  return score;
};
