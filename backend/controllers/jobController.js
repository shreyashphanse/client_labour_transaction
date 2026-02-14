import Job from "../models/Job.js";
import { isStationOverlap } from "../utils/stationUtils.js";

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

// ✅ GET ALL JOBS (ONLY OPEN)
export const getJobs = async (req, res) => {
  try {
    const { skill, from, to } = req.query;

    let jobs = await Job.find({ status: "open" });

    if (skill) {
      jobs = jobs.filter((job) => job.skillRequired === skill);
    }

    if (from && to) {
      jobs = jobs.filter((job) =>
        isStationOverlap(job.stationRange.from, job.stationRange.to, from, to),
      );
    }

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
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.status === "completed")
      return res.status(400).json({ message: "Cannot cancel completed job" });

    job.status = "cancelled";

    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
