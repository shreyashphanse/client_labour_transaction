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
