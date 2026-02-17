import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    labour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    deadlineAt: {
      type: Date,
      required: true,
    },

    penaltyAppliedHours: {
      type: Number,
      default: 0,
    },

    proofImage: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "pending", // waiting for proof
        "proof_uploaded", // client submitted
        "pending_confirmation", // waiting labour action
        "verified",
        "disputed",
      ],
      default: "pending",
    },

    /* ✅ CRITICAL FOR RELIABILITY ENGINE */
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Payment", paymentSchema);
