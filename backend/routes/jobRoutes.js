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
import { checkBan } from "../middleware/checkBan.js";

const router = express.Router();

// ✅ CREATE JOB → Logged users only (client logic inside controller)
router.post("/create", protect, checkBan, createJob);

// ✅ GET JOBS → Logged users only
router.get("/", protect, checkBan, getJobs);

// ✅ ACCEPT JOB → Labour only
router.patch("/:id/accept", protect, checkBan, labourOnly, acceptJob);

// ✅ REJECT JOB → Labour only
router.patch("/:id/reject", protect, checkBan, labourOnly, rejectJob);

// ✅ COMPLETE JOB → Labour only
router.patch("/:id/complete", protect, checkBan, labourOnly, completeJob);

// ✅ CANCEL JOB → Auth required (ownership check inside controller)
router.patch("/:id/cancel", protect, checkBan, cancelJob);

// ✅ LABOUR STATS → Labour viewing own stats
router.get(
  "/labour-stats/:labourId",
  protect,
  checkBan,
  checkBan,
  labourOnly,
  getLabourStats,
);

// ✅ CLIENT STATS → Any logged user (or restrict later)
router.get("/client-stats/:clientId", protect, checkBan, getClientStats);

// ✅ GET ALL MY POSTED JOBS
router.get("/my-posted", protect, checkBan, getMyPostedJobs);

// ✅ GET ALL MY ACCEPTED JOBS
router.get("/my-accepted", protect, checkBan, labourOnly, getMyAcceptedJobs);

// ✅ GET ALL MY COMPLETED JOBS
router.get("/my-completed", protect, checkBan, getMyCompletedJobs);

// ✅ DASHBOARD DATA → Separate endpoints for client and labour dashboards
router.get("/dashboard/client", protect, checkBan, getClientDashboard);

// ✅ SUBMIT RATING → Auth required, ownership check inside controller
router.patch("/:id/rate", protect, checkBan, submitRating);

// ✅ DASHBOARD DATA → Separate endpoints for client and labour dashboards
router.get(
  "/dashboard/labour",
  protect,
  checkBan,
  checkBan,
  labourOnly,
  getLabourDashboard,
);

export default router;
