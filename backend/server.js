import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import jobRoutes from "./routes/jobRoutes.js";
import Job from "./models/Job.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";
import Payment from "./models/Payment.js";
import User from "./models/User.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ CRITICAL FIX
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ✅ EXPIRY CHECKER 🔥
setInterval(async () => {
  try {
    const now = new Date();

    const expiredJobs = await Job.updateMany(
      {
        status: "open",
        expiresAt: { $lt: now },
      },
      {
        status: "expired",
      },
    );

    if (expiredJobs.modifiedCount > 0) {
      console.log(`Expired ${expiredJobs.modifiedCount} jobs`);
    }
  } catch (error) {
    console.error("Expiry Check Error:", error.message);
  }
}, 60000); // runs every 60 seconds

setInterval(async () => {
  try {
    const now = new Date();

    const overduePayments = await Payment.find({
      status: "pending",
      deadlineAt: { $lt: now },
    });

    for (const payment of overduePayments) {
      const hoursOverdue = Math.floor(
        (now - payment.deadlineAt) / (60 * 60 * 1000),
      );

      const penaltyHoursToApply = hoursOverdue - payment.penaltyAppliedHours;

      if (penaltyHoursToApply <= 0) continue;

      const client = await User.findById(payment.client);

      if (!client) continue;

      const penalty = penaltyHoursToApply * 5;

      client.reliabilityScore -= penalty;

      // ✅ Safety floor (VERY IMPORTANT)
      if (client.reliabilityScore < 0) client.reliabilityScore = 0;

      await client.save();

      payment.penaltyAppliedHours += penaltyHoursToApply;

      await payment.save();

      console.log(`Penalty applied: Client ${client._id} -${penalty}`);
    }
  } catch (error) {
    console.error("Penalty Engine Error:", error.message);
  }
}, 60000); // runs every 60 seconds
