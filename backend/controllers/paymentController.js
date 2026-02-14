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
