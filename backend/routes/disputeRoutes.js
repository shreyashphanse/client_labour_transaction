import express from "express";
import {
  raiseDispute,
  getMyDisputes,
} from "../controllers/disputeController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("evidence"), raiseDispute);
router.get("/my", protect, getMyDisputes);

export default router;
