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
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* ✅ BASIC FIELDS */

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.address !== undefined) user.address = req.body.address;
    if (req.body.gender !== undefined) user.gender = req.body.gender;
    if (req.body.dob !== undefined) user.dob = req.body.dob;

    /* ✅ STATION RANGE FIX 🔥 */

    if (req.body.stationFrom || req.body.stationTo) {
      user.stationRange = {
        start: req.body.stationFrom || user.stationRange?.start,
        end: req.body.stationTo || user.stationRange?.end,
      };
    }

    /* ✅ SKILLS FIX 🔥 */

    if (req.body.skills) {
      user.skills = JSON.parse(req.body.skills);
    }

    /* ✅ PROFILE PHOTO */

    if (req.file) {
      user.profilePhoto = `/${req.file.path.replace(/\\/g, "/")}`;
    }

    await user.save();

    res.json(user);
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
