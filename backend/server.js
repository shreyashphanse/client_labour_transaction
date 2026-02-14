import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import jobRoutes from "./routes/jobRoutes.js";
import Job from "./models/Job.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/api/jobs", jobRoutes);

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
