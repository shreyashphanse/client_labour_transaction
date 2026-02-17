import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  recalculateReliability,
} from "../controllers/userController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* ✅ NORMAL USER PROFILE */
router.get("/profile", protect, getMyProfile);

router.patch(
  "/profile",
  protect,
  upload.single("profilePhoto"), // 🔥 THIS WAS MISSING
  updateMyProfile,
);

/* ✅ ADMIN ONLY */
router.patch(
  "/:userId/recalculate",
  protect,
  adminOnly,
  recalculateReliability,
);

export default router;
