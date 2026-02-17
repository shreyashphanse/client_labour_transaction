import User from "../models/User.js";
import Job from "../models/Job.js";
import Dispute from "../models/Dispute.js";

/* USERS */
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

/* JOBS */
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("createdBy", "name phone")
      .populate("labourId", "name phone");

    res.json(
      jobs.map((job) => ({
        _id: job._id,

        title: job.title,
        status: job.status,

        offeredPrice: job.budget, // ✅ FIX
        skill: job.skillRequired, // ✅ FIX

        accepted: job.status === "assigned", // ✅ FIX

        client: job.createdBy?.name || "Unknown", // ✅ FIX
        labour: job.labourId?.name || "Unassigned", // ✅ FIX

        stationRange: {
          start: job.stationRange?.from, // ✅ FIX
          end: job.stationRange?.to,
        },

        createdAt: job.createdAt,
      })),
    );
  } catch (err) {
    console.error("ADMIN JOB FETCH ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* METRICS */
export const getMetrics = async (req, res) => {
  const users = await User.find();
  const jobs = await Job.find();

  const verifiedProviders = users.filter(
    (u) => u.role === "labour" && u.verificationStatus !== "unverified",
  ).length;

  const acceptedJobs = jobs.filter(
    (j) => j.status === "assigned" || j.status === "completed",
  ).length;

  const acceptanceRate = jobs.length
    ? Math.round((acceptedJobs / jobs.length) * 100)
    : 0;

  res.json({
    verifiedProviders,
    jobsPosted: jobs.length,
    acceptanceRate,
  });
};

/* VERIFY */
export const toggleVerify = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    let newStatus;

    if (user.verificationStatus === "unverified") {
      newStatus = "basic_verified";
    } else if (user.verificationStatus === "basic_verified") {
      newStatus = "trusted_verified";
    } else {
      newStatus = "unverified"; // reset cycle
    }

    await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: newStatus },
      { new: true },
    );

    res.json({ message: "Verification updated" });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* BAN */
export const toggleBan = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.banned = !user.banned;
  await user.save();

  res.json({ message: "Ban updated" });
};

/* DELETE JOB */
export const deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) return res.status(404).json({ message: "Job not found" });

  await job.deleteOne();

  res.json({ message: "Job deleted" });
};

/* FORCE CANCEL JOB */
export const forceCancelJob = async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) return res.status(404).json({ message: "Job not found" });

  job.status = "cancelled";
  await job.save();

  res.json({ message: "Job cancelled by admin" });
};

export const updateVerification = async (req, res) => {
  try {
    const { action } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    let newStatus = user.verificationStatus;

    if (action === "promote") {
      if (user.verificationStatus === "unverified")
        newStatus = "basic_verified";
      else if (user.verificationStatus === "basic_verified")
        newStatus = "trusted_verified";
    }

    if (action === "demote") {
      if (user.verificationStatus === "trusted_verified")
        newStatus = "basic_verified";
      else if (user.verificationStatus === "basic_verified")
        newStatus = "unverified";
    }

    if (action === "reset") {
      newStatus = "unverified";
    }

    await User.findByIdAndUpdate(req.params.id, {
      verificationStatus: newStatus,
    });

    res.json({ message: "Verification updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const rejectDispute = async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) return res.status(404).json({ message: "Dispute not found" });

  dispute.status = "rejected";
  dispute.adminNote = req.body.adminNote || null;

  await dispute.save();

  /* ✅ RESTORE JOB STATUS */
  const job = await Job.findById(dispute.job);
  if (job) {
    job.status = dispute.previousJobStatus || "completed";
    await job.save();
  }

  res.json({ message: "Dispute rejected" });
};

export const resolveDispute = async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) return res.status(404).json({ message: "Dispute not found" });

  const { decisionAgainst } = req.body;

  if (!decisionAgainst) {
    return res.status(400).json({ message: "Decision target required" });
  }

  dispute.status = "resolved";
  dispute.decisionAgainst = decisionAgainst;
  dispute.adminNote = req.body.adminNote || null;

  await dispute.save();

  const losingUser = await User.findById(decisionAgainst);

  if (losingUser) {
    /* ✅ Reliability Penalty */
    losingUser.reliabilityScore = Math.max(0, losingUser.reliabilityScore - 10);

    /* ✅ Dispute Counter */
    losingUser.disputeCount += 1;

    /* ✅ Risk Classification */
    if (losingUser.disputeCount >= 5) {
      losingUser.riskLevel = "dangerous";
    } else if (losingUser.disputeCount >= 2) {
      losingUser.riskLevel = "risky";
    }

    await losingUser.save();
  }

  /* ✅ UPDATE JOB STATUS */
  const job = await Job.findById(dispute.job);
  if (job) {
    job.status = dispute.previousJobStatus || "completed";
    await job.save();
  }

  res.json({ message: "Dispute resolved" });
};

export const getDisputes = async (req, res) => {
  const disputes = await Dispute.find()
    .populate("job")
    .populate("raisedBy", "name phone")
    .populate("against", "name phone")
    .sort({ createdAt: -1 });

  res.json(disputes);
};
