import express from "express";
import {
  submitRating,
  getUserRatings,
} from "../controllers/ratingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, submitRating);
router.get("/:userId", protect, getUserRatings);

export default router;
