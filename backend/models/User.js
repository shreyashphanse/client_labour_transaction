import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      sparse: true, // allows null + unique
      lowercase: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null, // ✅ prevents undefined / empty issues

      validate: {
        // ✅ ADD THIS RIGHT HERE
        validator: function (v) {
          return v === null || ["male", "female", "other"].includes(v);
        },
        message: "Invalid gender value",
      },
    },

    dob: {
      type: Date,
      default: null,
    },

    profilePhoto: {
      type: String,
      default: null,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["client", "labour", "admin"],
      required: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    stationRange: {
      start: { type: String },
      end: { type: String },
    },

    expectedRate: {
      type: Number,
      default: 0,
    },

    availability: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },

    verificationStatus: {
      type: String,
      enum: ["unverified", "basic_verified", "trusted_verified"],
      default: "unverified",
    },

    riskLevel: {
      type: String,
      enum: ["normal", "risky", "dangerous"],
      default: "normal",
    },

    banned: {
      type: Boolean,
      default: false,
    },

    disputeCount: {
      type: Number,
      default: 0,
    },

    stats: {
      completedJobs: { type: Number, default: 0 },
      cancelledJobs: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      ratingSum: { type: Number, default: 0 },
    },

    reliabilityScore: {
      type: Number,
      default: 50, // neutral baseline
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
