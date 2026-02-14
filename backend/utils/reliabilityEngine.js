export const updateReliability = (currentScore, change) => {
  let newScore = currentScore + change;

  // ✅ Clamp limits
  if (newScore > 100) newScore = 100;
  if (newScore < 0) newScore = 0;

  return newScore;
};
