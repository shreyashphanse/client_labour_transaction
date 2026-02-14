import Job from "../models/Job.js";
import { isStationOverlap } from "../utils/stationUtils.js";
import { getBudgetCompatibility } from "../utils/budgetUtils.js";
import { calculateJobScore } from "../utils/rankingUtils.js";
import { calculateReliabilityScore } from "../utils/reliabilityUtils.js";
import { calculateSuccessProbability } from "../utils/probabilityUtils.js";

// ✅ CREATE JOB
export const createJob = async (req, res) => {
  try {
    const { clientId, title, description, skillRequired, from, to, budget } =
      req.body;

    const job = await Job.create({
      clientId,
      title,
      description,
      skillRequired,
      stationRange: { from, to },
      budget,
      // expiresAt: new Date(Date.now() + 30 * 1000), // 24 hrs expiry
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hrs expiry
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

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const labourId = req.user._id;

    // Prevent duplicate rejection
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
    const { skill, from, to, expectedRate } = req.query;

    let jobs = await Job.find({ status: "open" });

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

    // ✅ SINGLE MAP 🔥🔥🔥
    jobs = jobs.map((job) => {
      const budgetCompatibility = getBudgetCompatibility(
        job.budget,
        Number(expectedRate),
      );

      const clientScore = 70; // TEMPORARY 😏 (dynamic next)

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

// ✅ ACCEPT JOB
export const acceptJob = async (req, res) => {
  try {
    const { labourId } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.status !== "open")
      return res.status(400).json({ message: "Job already taken" });

    job.status = "assigned";
    job.labourId = labourId;

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

    if (job.status !== "assigned")
      return res.status(400).json({ message: "Invalid job state" });

    job.status = "completed";

    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CANCEL JOB
export const cancelJob = async (req, res) => {
  try {
    const { cancelledBy, reason } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.status === "completed")
      return res.status(400).json({ message: "Cannot cancel completed job" });

    job.status = "cancelled";

    job.cancellation = {
      cancelledBy,
      reason,
    };

    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
