import User from "../models/User.js";
import Job from "../models/Job.js";

/* USERS */
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

/* JOBS */
export const getJobs = async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
};

/* DISPUTES (mock until schema exists) */
export const getDisputes = async (req, res) => {
  res.json([]); // temporary
};

/* METRICS */
export const getMetrics = async (req, res) => {
  const users = await User.find();
  const jobs = await Job.find();

  const verifiedProviders = users.filter((u) => u.verified).length;

  const acceptedJobs = jobs.filter((j) => j.accepted === true).length;

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

/* RESOLVE DISPUTE */
export const resolveDispute = async (req, res) => {
  res.json({ message: "Dispute resolved (mock)" });
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
