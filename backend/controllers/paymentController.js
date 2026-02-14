export const uploadProof = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.proofImage = req.body.proofImage;
    payment.status = "proof_uploaded";

    await payment.save();

    res.json({ message: "Proof uploaded" });
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

    payment.status = "confirmed";

    await payment.save();

    res.json({ message: "Payment confirmed" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = "verified";

    await payment.save();

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
