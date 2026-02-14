import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    labourId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    skillRequired: {
      type: String,
      required: true,
    },

    stationRange: {
      from: {
        type: String,
        required: true,
      },
      to: {
        type: String,
        required: true,
      },
    },

    budget: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "open",
        "assigned",
        "completed",
        "cancelled",
        "disputed",
        "expired",
      ],
      default: "open",
    },

    payment: {
      proofUploaded: {
        type: Boolean,
        default: false,
      },

      proofImage: {
        type: String,
        default: null,
      },

      labourConfirmed: {
        type: Boolean,
        default: false,
      },

      adminVerified: {
        type: Boolean,
        default: false,
      },

      paidAt: {
        type: Date,
        default: null,
      },
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
