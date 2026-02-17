import express from "express";
import {
  uploadProof,
  confirmPayment,
  getMyPayments,
  getMyEarnings,
  getAllPayments,
  disputePayment,
} from "../controllers/paymentController.js";

import {
  protect,
  labourOnly,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch("/:id/proof", protect, uploadProof);

router.patch("/:id/confirm", protect, labourOnly, confirmPayment);

router.get("/my-payments", protect, getMyPayments);

router.get("/my-earnings", protect, labourOnly, getMyEarnings);

router.patch("/:id/dispute", protect, labourOnly, disputePayment);

router.get("/", protect, adminOnly, getAllPayments);

export default router;
