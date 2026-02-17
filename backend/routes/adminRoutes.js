import express from "express";
import {
  getUsers,
  getJobs,
  getDisputes,
  getMetrics,
  toggleVerify,
  toggleBan,
  deleteJob,
  forceCancelJob,
  updateVerification,
  resolveDispute,
  rejectDispute,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", getUsers);
router.get("/jobs", getJobs);
router.get("/metrics", getMetrics);

router.patch("/users/:id/verify", toggleVerify);
router.patch("/users/:id/ban", toggleBan);
router.delete("/jobs/:id", deleteJob);
router.patch("/jobs/:id/cancel", forceCancelJob);
router.patch("/users/:id/verification", updateVerification);
router.get("/disputes", getDisputes);
router.patch("/disputes/:id/resolve", resolveDispute);
router.patch("/disputes/:id/reject", rejectDispute);

export default router;
