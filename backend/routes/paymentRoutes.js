import express from "express";
import {
  uploadProof,
  confirmPayment,
  verifyPayment,
} from "../controllers/paymentController.js";

import {
  protect,
  labourOnly,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch("/:id/proof", protect, uploadProof);

router.patch("/:id/confirm", protect, labourOnly, confirmPayment);

router.patch("/:id/verify", protect, adminOnly, verifyPayment);

export default router;
