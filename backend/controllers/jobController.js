import Job from "../models/Job.js";
import { isStationOverlap, getOverlapStrength } from "../utils/stationUtils.js";
import { getBudgetCompatibility } from "../utils/budgetUtils.js";
import { calculateJobScore } from "../utils/rankingUtils.js";
import { calculateReliabilityScore } from "../utils/reliabilityUtils.js";
import { calculateSuccessProbability } from "../utils/probabilityUtils.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { calculateReputation } from "../utils/reputationEngine.js";

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
    /* ✅ RISK ENGINE VISIBILITY BLOCK */
    if (req.user.riskLevel === "dangerous") {
      return res.json([]);
    }

    const { skill, from, to, expectedRate } = req.query;

    let jobs = await Job.find({
      status: "open",
      createdBy: { $ne: userId },
      rejectedBy: { $ne: userId },
    });

    if (skill) {
      jobs = jobs.filter(
        (job) => job.skillRequired.toLowerCase() === skill.toLowerCase(),
      );
    }

    if (from && to) {
      jobs = jobs.filter((job) =>
        isStationOverlap(job.stationRange.from, job.stationRange.to, from, to),
      );
    }

    const enrichedJobs = [];

    for (const job of jobs) {
      const budgetCompatibility = getBudgetCompatibility(
        job.budget,
        Number(expectedRate),
      );

      const stationOverlapStrength = getOverlapStrength(
        job.stationRange.from,
        job.stationRange.to,
        req.user.stationRange?.start,
        req.user.stationRange?.end,
      );

      const skillMatch =
        !req.user.skills?.length || req.user.skills.includes(job.skillRequired);

      const client = await User.findById(job.createdBy);

      const clientReliability = client?.reliabilityScore || 50;

      const successProbability = calculateSuccessProbability({
        clientScore: clientReliability,
        budgetCompatibility,
        stationOverlapStrength,
        skillMatch,
      });

      enrichedJobs.push({
        ...job._doc,

        budgetCompatibility,

        successProbability,

        score: calculateJobScore(job, Number(expectedRate), {
          skillMatch,
          stationOverlapStrength,

          clientReliability, // already exists
          labourReliability: req.user.reliabilityScore, // ✅ NEW
          clientRisk: client?.riskLevel, // ✅ NEW

          budgetCompatibility,
          successProbability,
        }),
      });
    }

    enrichedJobs.sort((a, b) => b.score - a.score);

    res.json(enrichedJobs);
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

    const enrichedJobs = [];

    for (const job of jobs) {
      const payment = await Payment.findOne({ job: job._id });

      enrichedJobs.push({
        ...job._doc,
        paymentStatus: payment?.status || null,
        paymentId: payment?._id || null,
        paymentDeadline: payment?.deadlineAt || null,
      });
    }

    res.json(enrichedJobs); // ✅ ONLY RESPONSE
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

    const enrichedJobs = [];

    for (const job of jobs) {
      const payment = await Payment.findOne({ job: job._id });

      enrichedJobs.push({
        ...job._doc,

        paymentStatus: payment?.status || null,
        paymentId: payment?._id || null,
      });
    }

    res.json(enrichedJobs);
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

    if (!job.labourId) {
      return res.status(400).json({ message: "No labour assigned" });
    }

    // ✅ Ownership check
    if (!job.labourId || job.labourId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ State guards
    if (job.status === "completed") {
      return res.status(400).json({ message: "Job already completed" });
    }

    if (job.status !== "assigned" && job.status !== "in_progress") {
      return res.status(400).json({ message: "Job cannot be completed" });
    }

    // ✅ Completion update
    job.status = "completed";
    job.completedAt = new Date();

    await job.save();

    /* ✅ PAYMENT GENERATION 🔥 */

    const existingPayment = await Payment.findOne({ job: job._id });

    if (!existingPayment) {
      const deadline = new Date(job.completedAt.getTime() + 2 * 60 * 60 * 1000);

      await Payment.create({
        job: job._id,
        client: job.createdBy,
        labour: job.labourId,
        amount: job.budget,
        deadlineAt: deadline,
        status: "pending",
      });
    }

    /* ✅ RELIABILITY UPDATE (LABOUR) */

    const labour = await User.findById(job.labourId);

    if (labour) {
      labour.stats.completedJobs += 1;
      labour.reliabilityScore = calculateReputation(labour);

      await labour.save(); // ✅ ONLY ONCE
    }

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

    user.stats.cancelledJobs += 1;

    user.reliabilityScore = calculateReputation(user);

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

    // ✅ Safe initialization
    if (!job.ratings) {
      job.ratings = {
        clientToLabour: { rating: null, review: null },
        labourToClient: { rating: null, review: null },
      };
    }

    // ✅ Save rating on job
    if (req.user.role === "client") {
      job.ratings.clientToLabour = { rating, review };
    }

    if (req.user.role === "labour") {
      job.ratings.labourToClient = { rating, review };
    }

    await job.save();

    /* ✅ RELIABILITY UPDATE */

    const targetUser =
      req.user.role === "client"
        ? await User.findById(job.labourId)
        : await User.findById(job.createdBy);

    if (targetUser) {
      targetUser.stats.totalRatings += 1;
      targetUser.stats.ratingSum += rating;

      targetUser.reliabilityScore = calculateReputation(targetUser);

      await targetUser.save();
    }

    res.json({ message: "Rating saved" });
  } catch (err) {
    console.error("RATING ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
