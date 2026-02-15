import User from "../models/User.js";
import Job from "../models/Job.js";
import Payment from "../models/Payment.js";
import { calculateReliabilityScore } from "../utils/reliabilityEngine.js";

export const recalculateReliability = async (req, res) => {
  try {
    const userId = req.params.userId;

    const completedJobs = await Job.countDocuments({
      acceptedBy: userId,
      status: "completed",
    });

    const cancelledJobs = await Job.countDocuments({
      acceptedBy: userId,
      status: "cancelled",
    });

    const verifiedPayments = await Payment.countDocuments({
      labour: userId,
      status: "verified",
    });

    const newScore = calculateReliabilityScore({
      completedJobs,
      cancelledJobs,
      verifiedPayments,
    });

    const user = await User.findById(userId);

    user.reliabilityScore = newScore;
    await user.save();

    res.json({ reliabilityScore: newScore });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
