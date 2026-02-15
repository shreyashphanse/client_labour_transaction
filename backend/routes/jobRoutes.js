import express from "express";
import {
  createJob,
  getJobs,
  acceptJob,
  completeJob,
  cancelJob,
  getLabourStats,
  getClientStats,
  rejectJob,
  getMyPostedJobs,
  getMyAcceptedJobs,
  getMyCompletedJobs,
  getClientDashboard,
  getLabourDashboard,
  submitRating,
} from "../controllers/jobController.js";

import {
  protect,
  adminOnly,
  labourOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ CREATE JOB → Logged users only (client logic inside controller)
router.post("/create", protect, createJob);

// ✅ GET JOBS → Logged users only
router.get("/", protect, getJobs);

// ✅ ACCEPT JOB → Labour only
router.patch("/:id/accept", protect, labourOnly, acceptJob);

// ✅ REJECT JOB → Labour only
router.patch("/:id/reject", protect, labourOnly, rejectJob);

// ✅ COMPLETE JOB → Labour only
router.patch("/:id/complete", protect, labourOnly, completeJob);

// ✅ CANCEL JOB → Auth required (ownership check inside controller)
router.patch("/:id/cancel", protect, cancelJob);

// ✅ LABOUR STATS → Labour viewing own stats
router.get("/labour-stats/:labourId", protect, labourOnly, getLabourStats);

// ✅ CLIENT STATS → Any logged user (or restrict later)
router.get("/client-stats/:clientId", protect, getClientStats);

// ✅ GET ALL MY POSTED JOBS
router.get("/my-posted", protect, getMyPostedJobs);

// ✅ GET ALL MY ACCEPTED JOBS
router.get("/my-accepted", protect, labourOnly, getMyAcceptedJobs);

// ✅ GET ALL MY COMPLETED JOBS
router.get("/my-completed", protect, getMyCompletedJobs);

// ✅ DASHBOARD DATA → Separate endpoints for client and labour dashboards
router.get("/dashboard/client", protect, getClientDashboard);

// ✅ SUBMIT RATING → Auth required, ownership check inside controller
router.patch("/:id/rate", protect, submitRating);

// ✅ DASHBOARD DATA → Separate endpoints for client and labour dashboards
router.get("/dashboard/labour", protect, labourOnly, getLabourDashboard);

export default router;
