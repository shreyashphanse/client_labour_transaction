import Job from "../models/Job.js";
import { isStationOverlap } from "../utils/stationUtils.js";
import { getBudgetCompatibility } from "../utils/budgetUtils.js";
import { calculateJobScore } from "../utils/rankingUtils.js";
import { calculateReliabilityScore } from "../utils/reliabilityUtils.js";
import { calculateSuccessProbability } from "../utils/probabilityUtils.js";
import Payment from "../models/Payment.js";
import { updateReliability } from "../utils/reliabilityEngine.js";
import User from "../models/User.js";

// ✅ CREATE JOB
export const createJob = async (req, res) => {
  try {
    const { title, description, skillRequired, from, to, budget } = req.body;

    const job = await Job.create({
      createdBy: req.user._id, // ✅ CRITICAL FIX
      title,
      description,
      skillRequired,
      stationRange: { from, to },
      budget,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ JOB REJECTION FUNCTIONALITY (NEW) - LABOURS CAN REJECT JOBS TO IMPROVE MATCHING ALGORITHM
export const rejectJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    // ✅ Only reject open jobs 🔥
    if (job.status !== "open") {
      return res.status(400).json({ message: "Cannot reject this job" });
    }

    const labourId = req.user._id;

    // ✅ Prevent duplicate rejection
    if (job.rejectedBy.includes(labourId)) {
      return res.status(400).json({ message: "Already rejected" });
    }

    job.rejectedBy.push(labourId);

    await job.save();

    res.json({ message: "Job rejected" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ GET CLIENT STATS

export const getClientStats = async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const completedJobs = await Job.countDocuments({
      clientId,
      status: "completed",
    });

    const cancelledJobs = await Job.countDocuments({
      clientId,
      "cancellation.cancelledBy": "client",
    });

    const stats = {
      completedJobs,
      cancelledJobs,
    };

    const reliabilityScore = calculateReliabilityScore(stats);

    res.json({
      stats,
      reliabilityScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET LABOUR STATS

export const getLabourStats = async (req, res) => {
  try {
    const labourId = req.params.labourId;

    const completedJobs = await Job.countDocuments({
      labourId,
      status: "completed",
    });

    const cancelledJobs = await Job.countDocuments({
      labourId,
      "cancellation.cancelledBy": "labour",
    });

    const stats = {
      completedJobs,
      cancelledJobs,
    };

    const reliabilityScore = calculateReliabilityScore(stats);

    res.json({
      stats,
      reliabilityScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL JOBS (ONLY OPEN)

export const getJobs = async (req, res) => {
  try {
    const userId = req.user._id;

    const { skill, from, to, expectedRate } = req.query;

    // ✅ Base Query (CRITICAL FIX)
    let jobs = await Job.find({
      status: "open",
      createdBy: { $ne: userId }, // ❌ Hide own jobs
      rejectedBy: { $ne: userId }, // ❌ Hide rejected jobs
    });

    // ✅ Skill Filter
    if (skill) {
      jobs = jobs.filter(
        (job) => job.skillRequired.toLowerCase() === skill.toLowerCase(),
      );
    }

    // ✅ Station Overlap
    if (from && to) {
      jobs = jobs.filter((job) =>
        isStationOverlap(job.stationRange.from, job.stationRange.to, from, to),
      );
    }

    // ✅ SINGLE MAP 🔥
    jobs = jobs.map((job) => {
      const budgetCompatibility = getBudgetCompatibility(
        job.budget,
        Number(expectedRate),
      );

      const clientScore = 70; // TEMP (dynamic later)

      return {
        ...job._doc,

        budgetCompatibility,

        score: calculateJobScore(job, Number(expectedRate)),

        successProbability: calculateSuccessProbability({
          clientScore,
          budgetCompatibility,
        }),
      };
    });

    // ✅ SORT
    jobs.sort((a, b) => b.score - a.score);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET CLIENT DASHBOARD STATS (NEW)
export const getClientDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalJobs = await Job.countDocuments({ createdBy: userId });

    const completedJobs = await Job.countDocuments({
      createdBy: userId,
      status: "completed",
    });

    const cancelledJobs = await Job.countDocuments({
      createdBy: userId,
      status: "cancelled",
    });

    const activeJobs = await Job.countDocuments({
      createdBy: userId,
      status: { $in: ["open", "accepted", "in_progress"] },
    });

    res.json({
      totalJobs,
      completedJobs,
      cancelledJobs,
      activeJobs,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ GET LABOUR DASHBOARD STATS (NEW)
export const getLabourDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const acceptedJobs = await Job.countDocuments({
      labourId: userId,
    });

    const completedJobs = await Job.countDocuments({
      labourId: userId,
      status: "completed",
    });

    const cancelledJobs = await Job.countDocuments({
      labourId: userId,
      status: "cancelled",
    });

    const activeJobs = await Job.countDocuments({
      labourId: userId,
      status: "assigned",
    });

    const earnings = await Payment.aggregate([
      { $match: { labour: userId, status: "verified" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      acceptedJobs,
      completedJobs,
      cancelledJobs,
      activeJobs,
      totalEarnings: earnings[0]?.total || 0,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ GET ALL MY POSTED JOBS (ONLY OPEN)
export const getMyPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ GET ALL MY ACCEPTED JOBS (ONLY OPEN)
export const getMyAcceptedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      labourId: req.user._id,
      status: { $in: ["assigned", "in_progress"] },
    }).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ GET ALL MY COMPLETED JOBS (ONLY OPEN)
export const getMyCompletedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [{ createdBy: req.user._id }, { labourId: req.user._id }],
      status: "completed",
    }).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ ACCEPT JOB
export const acceptJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.status !== "open") {
      return res.status(400).json({ message: "Job not available" });
    }

    job.status = "assigned"; // ✅ ENUM SAFE
    job.labourId = req.user._id; // ✅ SCHEMA SAFE

    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ COMPLETE JOB
export const completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    // ✅ Correct ownership check
    if (!job.labourId || job.labourId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (job.status === "completed") {
      return res.status(400).json({ message: "Job already completed" });
    }

    if (job.status !== "assigned" && job.status !== "in_progress") {
      return res.status(400).json({ message: "Job cannot be completed" });
    }

    job.status = "completed";
    await job.save();

    // ✅ Prevent duplicate payment
    const existingPayment = await Payment.findOne({ job: job._id });

    if (!existingPayment) {
      await Payment.create({
        job: job._id,
        client: job.createdBy,
        labour: job.labourId,
        amount: job.budget,
      });
    }

    // ✅ Reliability reward
    const labour = await User.findById(job.labourId);

    labour.reliabilityScore = updateReliability(labour.reliabilityScore, +5);

    await labour.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CANCEL JOB
export const cancelJob = async (req, res) => {
  try {
    const { reason } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    // ✅ Prevent illegal cancellation 🔥🔥🔥
    if (job.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel completed job" });
    }

    if (job.status === "cancelled") {
      return res.status(400).json({ message: "Job already cancelled" });
    }

    job.status = "cancelled";

    job.cancellation = {
      cancelledBy: req.user.role, // ✅ FIXED
      reason,
    };

    await job.save();

    // ✅ Reliability Penalty 🔥
    const user = await User.findById(req.user._id);

    user.reliabilityScore = updateReliability(user.reliabilityScore, -10);

    await user.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ SUBMIT RATING
export const submitRating = async (req, res) => {
  try {
    const { rating, review } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.status !== "completed") {
      return res.status(400).json({ message: "Job not completed" });
    }

    // ✅ CRITICAL SAFETY FIX 🔥🔥🔥
    if (!job.ratings) {
      job.ratings = {
        clientToLabour: { rating: null, review: null },
        labourToClient: { rating: null, review: null },
      };
    }

    if (req.user.role === "client") {
      job.ratings.clientToLabour = { rating, review };
    }

    if (req.user.role === "labour") {
      job.ratings.labourToClient = { rating, review };
    }

    await job.save();

    res.json({ message: "Rating saved" });
  } catch (err) {
    console.error("RATING ERROR:", err); // ✅ DEBUG LINE
    res.status(500).json({ message: err.message });
  }
};
