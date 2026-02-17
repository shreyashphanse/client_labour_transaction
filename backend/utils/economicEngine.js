export const getEconomicStrength = (clientScore) => {
  if (clientScore >= 80) return 1.25; // premium client
  if (clientScore >= 60) return 1.1; // strong client
  if (clientScore >= 40) return 1.0; // neutral
  if (clientScore >= 25) return 0.85; // weak client
  return 0.65; // suspicious client
};
