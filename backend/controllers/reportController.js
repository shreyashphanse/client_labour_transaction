import Report from "../models/Report.js";

export const reportUser = async (req, res) => {
  try {
    const { reportedUser, reason } = req.body;

    if (!reportedUser || !reason) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const report = await Report.create({
      reportedUser,
      reportedBy: req.user._id,
      reason,
    });

    res.json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reportedUser", "name phone")
      .populate("reportedBy", "name")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
