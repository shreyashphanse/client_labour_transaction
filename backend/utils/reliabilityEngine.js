export const updateReliability = (currentScore, change) => {
  let newScore = currentScore + change;

  if (newScore > 100) newScore = 100;
  if (newScore < 0) newScore = 0;

  return newScore;
};

// ✅ FULL RECALCULATION 🔥🔥🔥
export const calculateReliabilityScore = (stats) => {
  let score = 50; // ✅ Neutral baseline (NOT 100)

  score += stats.completedJobs * 5;
  score -= stats.cancelledJobs * 10;
  score += stats.verifiedPayments * 8;

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  return score;
};
