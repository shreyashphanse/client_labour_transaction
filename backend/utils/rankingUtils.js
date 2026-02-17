import { getEconomicStrength } from "./economicEngine.js";
export const calculateJobScore = (job, expectedRate, context = {}) => {
  let score = 0;

  const {
    skillMatch = true,
    stationOverlapStrength = 1,
    clientReliability = 50,
    labourReliability = 50, // ✅ NEW
    clientRisk = "normal", // ✅ NEW
    budgetCompatibility = "medium",
    successProbability = 50,
  } = context;

  /* ✅ Budget Base */
  const economicStrength = getEconomicStrength(clientReliability);

  score += Math.min(job.budget, 1000) * 0.5 * economicStrength;

  /* ✅ Budget Compatibility */
  if (budgetCompatibility === "high") score += 120;
  if (budgetCompatibility === "medium") score += 60;
  if (budgetCompatibility === "low") score -= 40;

  /* ✅ Skill */
  if (skillMatch) score += 80;
  else score -= 100;

  /* ✅ Station */
  score += stationOverlapStrength * 70;

  /* ✅ Client Reliability */
  score += (clientReliability - 50) * 1.5;
  /* ✅ Labour Reputation Bias 🔥 */
  score += (labourReliability - 50) * 1.0;

  /* ✅ Probability Boost 🔥 */
  score += successProbability * 0.8;

  /* ✅ Freshness */
  const hoursOld = (Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60);
  score -= Math.min(hoursOld, 24) * 4;
  /* ✅ RISK ENGINE SUPPRESSION 🔥🔥🔥 */
  if (clientRisk === "dangerous") score -= 80;
  if (clientRisk === "risky") score -= 25;

  return Math.round(score);
};
