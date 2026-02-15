import express from "express";
import {
  reportUser,
  getReports,
  updateReportStatus,
} from "../controllers/reportController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, reportUser);
router.get("/", protect, adminOnly, getReports);
router.patch("/:id", protect, adminOnly, updateReportStatus);

export default router;
