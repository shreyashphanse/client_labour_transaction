import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    against: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["pending", "resolved", "rejected"],
      default: "pending",
    },

    previousJobStatus: {
      type: String,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    evidence: {
      type: String, // store image URL / path
      default: null,
    },

    decisionAgainst: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    adminNote: {
      type: String,
      default: null,
    },

    type: {
      type: String,
      enum: ["job", "payment"],
      required: true,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Dispute", disputeSchema);
