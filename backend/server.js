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

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

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
