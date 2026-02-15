import express from "express";
import { recalculateReliability } from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch(
  "/:userId/recalculate",
  protect,
  adminOnly,
  recalculateReliability,
);

export default router;
