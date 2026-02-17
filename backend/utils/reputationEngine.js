export const calculateReputation = (user) => {
  const { completedJobs, cancelledJobs, totalRatings, ratingSum } = user.stats;

  const totalJobs = completedJobs + cancelledJobs;

  const completionRatio = totalJobs ? completedJobs / totalJobs : 0;

  const cancellationRatio = totalJobs ? cancelledJobs / totalJobs : 0;

  const avgRating = totalRatings ? ratingSum / totalRatings : 0;

  /* ✅ Weighted Formula */
  let score =
    50 + // base stability
    completionRatio * 30 +
    avgRating * 4 -
    cancellationRatio * 20 -
    user.disputeCount * 2;

  return Math.max(0, Math.min(100, Math.round(score)));
};
