import Report from "../models/Report.js";

export const reportUser = async (req, res) => {
  try {
    const { reportedUser, reason } = req.body;

    if (!reportedUser || !reason) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // ✅ Prevent self-report 🔥🔥🔥
    if (reportedUser === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot report yourself" });
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

export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = status;
    await report.save();

    // ✅ Apply penalty if resolved 🔥🔥🔥
    if (status === "resolved") {
      const user = await User.findById(report.reportedUser);

      user.reliabilityScore = updateReliability(
        user.reliabilityScore,
        -20, // 🔥 Strong penalty
      );

      await user.save();
    }

    res.json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
