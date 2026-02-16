import express from "express";
import {
  getUsers,
  getJobs,
  getDisputes,
  getMetrics,
  toggleVerify,
  toggleBan,
  resolveDispute,
  deleteJob,
  forceCancelJob,
  updateVerification,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", getUsers);
router.get("/jobs", getJobs);
router.get("/disputes", getDisputes);
router.get("/metrics", getMetrics);

router.patch("/users/:id/verify", toggleVerify);
router.patch("/users/:id/ban", toggleBan);
router.patch("/disputes/:id/resolve", resolveDispute);
router.delete("/jobs/:id", deleteJob);
router.patch("/jobs/:id/cancel", forceCancelJob);
router.patch("/users/:id/verification", updateVerification);

export default router;
