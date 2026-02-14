import express from "express";
import { reportUser, getReports } from "../controllers/reportController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, reportUser);
router.get("/", protect, adminOnly, getReports);

export default router;
