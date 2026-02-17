import Payment from "../models/Payment.js";
import User from "../models/User.js"; // ✅ ADD THIS
import { calculateReliabilityScore } from "../utils/reliabilityUtils.js"; // ✅ ALSO REQUIRED

export const uploadProof = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    if (payment.deadlineAt < new Date()) {
      console.log("Late payment proof submitted");
    }

    // ✅ ONLY CLIENT CAN UPLOAD PROOF
    if (payment.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ BLOCK INVALID STATE
    if (payment.status !== "pending") {
      return res.status(400).json({ message: "Proof already submitted" });
    }

    // ✅ HARD VALIDATION
    if (!req.body.proofImage) {
      return res.status(400).json({ message: "Proof image required" });
    }

    payment.proofImage = req.body.proofImage;

    payment.status = "pending_confirmation"; // ✅ IMPORTANT CHANGE

    await payment.save();

    res.json({ message: "Payment proof submitted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // ✅ ONLY LABOUR CAN CONFIRM
    if (payment.labour.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ VALID STATE CHECK
    if (payment.status !== "pending_confirmation") {
      return res.status(400).json({ message: "Invalid payment state" });
    }
    // ✅ PROOF SAFETY CHECK 🔥
    if (!payment.proofImage) {
      return res.status(400).json({ message: "No proof uploaded" });
    }

    payment.status = "verified";
    payment.verifiedAt = new Date();

    await payment.save();

    /* ✅ RELIABILITY ENGINE UPDATE */

    const clientStats = {
      completedJobs: await Payment.countDocuments({
        client: payment.client,
        status: "verified",
      }),
      cancelledJobs: 0,
      verifiedPayments: await Payment.countDocuments({
        client: payment.client,
        status: "verified",
      }),
    };

    const labourStats = {
      completedJobs: await Payment.countDocuments({
        labour: payment.labour,
        status: "verified",
      }),
      cancelledJobs: 0,
      verifiedPayments: await Payment.countDocuments({
        labour: payment.labour,
        status: "verified",
      }),
    };

    const client = await User.findById(payment.client);
    const labour = await User.findById(payment.labour);

    if (client) {
      client.reliabilityScore = calculateReliabilityScore(clientStats);
      await client.save();
    }

    if (labour) {
      labour.reliabilityScore = calculateReliabilityScore(labourStats);
      await labour.save();
    }

    res.json({ message: "Payment verified" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      client: req.user._id,
    })
      .populate("job")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getMyEarnings = async (req, res) => {
  try {
    const payments = await Payment.find({
      labour: req.user._id,
      status: "verified", // 🔥 Only real earnings
    })
      .populate("job")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("client", "name phone")
      .populate("labour", "name phone")
      .populate("job")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const disputePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.labour.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (payment.status !== "pending_confirmation") {
      return res.status(400).json({ message: "Cannot dispute this payment" });
    }

    payment.status = "disputed";

    await payment.save();

    res.json({ message: "Payment disputed" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
