import express from "express";
import {
  createJob,
  getJobs,
  acceptJob,
  completeJob,
  cancelJob,
} from "../controllers/jobController.js";

const router = express.Router();

router.post("/create", createJob);
router.get("/", getJobs);
router.patch("/:id/accept", acceptJob);
router.patch("/:id/complete", completeJob);
router.patch("/:id/cancel", cancelJob);

export default router;
