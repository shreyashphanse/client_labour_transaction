import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

ratingSchema.index({ job: 1, reviewer: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);
