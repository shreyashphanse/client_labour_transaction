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

/* ✅ GET MY PROFILE */
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    console.log("PROFILE FROM DB:", user);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ✅ UPDATE MY PROFILE */
export const updateMyProfile = async (req, res) => {
  try {
    console.log("BODY:", req.body); // 🔥 DEBUG
    console.log("FILE:", req.file); // 🔥 DEBUG
    const updates = {};

    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.address !== undefined) updates.address = req.body.address;
    if (req.body.gender !== undefined) updates.gender = req.body.gender;
    if (req.body.dob !== undefined) updates.dob = req.body.dob;

    /* ✅ PROFILE PHOTO FIX 🔥 */
    if (req.file) {
      updates.profilePhoto = `/${req.file.path.replace(/\\/g, "/")}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    res.json(user);
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
