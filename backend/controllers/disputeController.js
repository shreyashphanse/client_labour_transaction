import Dispute from "../models/Dispute.js";
import Job from "../models/Job.js";

/* ✅ RAISE DISPUTE */
export const raiseDispute = async (req, res) => {
  try {
    const { jobId, text } = req.body;

    if (!jobId || !text) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!job.labourId) {
      return res.status(400).json({ message: "No labour assigned" });
    }

    /* ✅ ONLY PARTICIPANTS CAN DISPUTE */
    const isParticipant =
      job.createdBy.toString() === req.user._id.toString() ||
      job.labourId.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized" });
    }

    /* ✅ JOB STATE GUARD */
    if (!["assigned", "completed"].includes(job.status)) {
      return res.status(400).json({
        message: "Dispute not allowed for this job state",
      });
    }

    /* ✅ PREVENT DUPLICATE DISPUTES */
    const existing = await Dispute.findOne({
      job: jobId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({
        message: "Dispute already exists for this job",
      });
    }

    const severity =
      text.length > 200 ? "high" : text.length > 80 ? "medium" : "low";

    const dispute = await Dispute.create({
      job: jobId,
      raisedBy: req.user._id,
      against: req.user.role === "client" ? job.labourId : job.createdBy,
      text,
      severity,
      previousJobStatus: job.status,
      evidence: req.file ? req.file.path : null, // ✅ NEW
    });

    job.status = "disputed";
    await job.save();

    res.status(201).json(dispute);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ✅ GET MY DISPUTES */
export const getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({
      raisedBy: req.user._id,
    })
      .populate("job")
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
